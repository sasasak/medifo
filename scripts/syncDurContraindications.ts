/**
 * 수집 스크립트 — 식약처 DUR 품목정보 병용금기(getUsjntTabooInfoList03) → 성분 기준 3개 테이블
 *   dur_ingredients            성분 코드와 대표 이름 (성분마다 가장 많이 나온 이름)
 *   dur_contraindication_rules 병용금기 성분 조합 (a < b로 정렬, (a, b, reason) 기준 중복 제거)
 *   medicine_ingredients       우리 medicines(item_seq) ↔ 성분 코드
 *
 * 실행:
 *   전체 수집 + 검증만 (DB 쓰기 없음): npx tsx --env-file=.env.local scripts/syncDurContraindications.ts --dry-run
 *   캐시로 저장 (다시 받지 않음):      npx tsx --env-file=.env.local scripts/syncDurContraindications.ts --from-cache
 *   수집 후 바로 저장:                 npx tsx --env-file=.env.local scripts/syncDurContraindications.ts
 *   건수 기대값 확인(어긋나면 저장 안 함): --expect=217/362/560 (성분/조합/우리 약, 2026-11-09 수집 기준)
 *
 * - 전체 약 1,583페이지(500건씩), 호출 약 1,585회, 약 75분 걸림 (#67 이전 측정)
 *   응답 헤더 x-ratelimit-limit가 10000이라 하루 한도로 추정함(공식 문서 미확인). 같은 날 다른 대량 호출은 피함
 * - 진행 파일과 집계 캐시는 os.tmpdir()/medifo-dur-sync 에만 저장함 (저장소에 쓰지 않음)
 *   중간에 멈추면 같은 명령으로 이어서 받음. 새로 받으려면 이 폴더를 지움
 * - 검증을 모두 통과한 집계만 저장하고, 저장 후 이번 실행 시각보다 오래된 행을 지움
 *
 * ⚠️ DATA_GO_KR_SERVICE_KEY는 Encoding 키라 URL에 그대로 붙인다 (syncMedicines.ts와 같음)
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAdminClient } from '../src/utils/supabase/admin';

const ENDPOINT =
  'https://apis.data.go.kr/1471000/DURPrdlstInfoService03/getUsjntTabooInfoList03';
const NUM_OF_ROWS = 500; // API 최대값 (1000으로 요청하면 resultCode 11)
const REQUEST_DELAY_MS = 300;
const MAX_RETRIES = 3;
const MIN_REMAINING_TO_START = 1600;
const UPSERT_CHUNK_SIZE = 500;

const WORK_DIR = path.join(os.tmpdir(), 'medifo-dur-sync');
const PROGRESS_FILE = path.join(WORK_DIR, 'progress.json');
const HASH_FILE = path.join(WORK_DIR, 'row-hashes.txt');
const CACHE_FILE = path.join(WORK_DIR, 'aggregate.json');

interface TabooItem {
  ITEM_SEQ: string | null;
  INGR_CODE: string | null;
  INGR_KOR_NAME: string | null;
  INGR_ENG_NAME: string | null;
  MIXTURE_ITEM_SEQ: string | null;
  MIXTURE_INGR_CODE: string | null;
  MIXTURE_INGR_KOR_NAME: string | null;
  MIXTURE_INGR_ENG_NAME: string | null;
  PROHBT_CONTENT: string | null;
}

class RateLimitError extends Error {}

// 집계 상태 — 진행 파일에 그대로 저장되므로 JSON으로 옮길 수 있는 값만 둔다
interface Aggregate {
  // 성분 코드 → { 이름: 나온 횟수 }
  korNames: Record<string, Record<string, number>>;
  engNames: Record<string, Record<string, number>>;
  // "a|b|reason" (a < b)
  rules: Record<string, true>;
  // "x>y" 방향 성분 쌍 (반대 방향 검증용)
  directedPairs: Record<string, true>;
  // "item_seq|ingr_code" 모든 DUR 품목 ↔ 성분 (저장 시 우리 medicines로 거름)
  itemIngredients: Record<string, true>;
  maxReasonBytes: number;
  missingFieldRows: number;
}

interface Progress {
  startedAt: string;
  totalCountAtStart: number | null;
  totalPages: number | null;
  nextPage: number;
  pageSizes: number[]; // 페이지 번호 - 1 위치
  rowsReceived: number;
  hashCount: number;
  calls: number;
  retries: number;
  rateLimitHits: number;
  requestMsTotal: number;
  lastRemaining: string | null;
  aggregate: Aggregate;
}

interface Validation {
  name: string;
  passed: boolean;
  detail: string;
}

interface CacheFile {
  createdAt: string;
  totalCount: number;
  fetch: Pick<
    Progress,
    'calls' | 'retries' | 'rateLimitHits' | 'requestMsTotal' | 'lastRemaining'
  > & { startedAt: string; finishedAt: string };
  validations: Validation[];
  ingredients: {
    ingr_code: string;
    name_kor: string;
    name_eng: string | null;
  }[];
  rules: { ingr_code_a: string; ingr_code_b: string; reason: string }[];
  itemIngredients: { item_seq: string; ingr_code: string }[];
  maxReasonBytes: number;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const expect = args
    .find((arg) => arg.startsWith('--expect='))
    ?.split('=')[1]
    ?.split('/')
    .map(Number);
  return {
    dryRun: args.includes('--dry-run'),
    fromCache: args.includes('--from-cache'),
    expect: expect?.length === 3 ? expect : null,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanText(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function emptyAggregate(): Aggregate {
  return {
    korNames: {},
    engNames: {},
    rules: {},
    directedPairs: {},
    itemIngredients: {},
    maxReasonBytes: 0,
    missingFieldRows: 0,
  };
}

function countName(
  target: Record<string, Record<string, number>>,
  code: string,
  name: string | null,
) {
  if (!name) return;
  target[code] ??= {};
  target[code][name] = (target[code][name] ?? 0) + 1;
}

function addItem(agg: Aggregate, item: TabooItem) {
  const a = cleanText(item.INGR_CODE);
  const b = cleanText(item.MIXTURE_INGR_CODE);
  const itemA = cleanText(item.ITEM_SEQ);
  const itemB = cleanText(item.MIXTURE_ITEM_SEQ);
  const nameA = cleanText(item.INGR_KOR_NAME);
  const nameB = cleanText(item.MIXTURE_INGR_KOR_NAME);
  if (!a || !b || !itemA || !itemB || !nameA || !nameB) {
    agg.missingFieldRows += 1;
    return;
  }

  countName(agg.korNames, a, nameA);
  countName(agg.korNames, b, nameB);
  countName(agg.engNames, a, cleanText(item.INGR_ENG_NAME));
  countName(agg.engNames, b, cleanText(item.MIXTURE_INGR_ENG_NAME));

  // 사유는 앞뒤 공백·줄바꿈을 지운 값으로 저장하고 비교함. 원문에 끝 줄바꿈만 다른 같은 사유가 있어
  // (예: "기능적 신부전에 의해 유산 산성증 촉진\n") 원문 그대로면 같은 조합이 2행으로 나뉨. 비어 있으면 ''
  const reason = cleanText(item.PROHBT_CONTENT) ?? '';
  const [low, high] = a < b ? [a, b] : [b, a];
  agg.rules[`${low}|${high}|${reason}`] = true;
  agg.directedPairs[`${a}>${b}`] = true;
  agg.itemIngredients[`${itemA}|${a}`] = true;
  agg.itemIngredients[`${itemB}|${b}`] = true;
  agg.maxReasonBytes = Math.max(
    agg.maxReasonBytes,
    Buffer.byteLength(reason, 'utf8'),
  );
}

function mostFrequent(
  counts: Record<string, number> | undefined,
): string | null {
  if (!counts) return null;
  // 횟수가 같으면 이름 순으로 골라 실행마다 결과가 같게 함
  return (
    Object.entries(counts).sort(
      ([nameA, countA], [nameB, countB]) =>
        countB - countA || nameA.localeCompare(nameB),
    )[0]?.[0] ?? null
  );
}

async function fetchPage(
  serviceKey: string,
  pageNo: number,
  progress: Progress,
) {
  const url = `${ENDPOINT}?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${NUM_OF_ROWS}&type=json`;

  for (let attempt = 0; ; attempt += 1) {
    const startedAt = Date.now();
    try {
      const res = await fetch(url);
      const text = await res.text();
      progress.calls += 1;
      progress.requestMsTotal += Date.now() - startedAt;
      progress.lastRemaining = res.headers.get('x-ratelimit-remaining');

      if (
        res.status === 429 ||
        /LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(text)
      ) {
        progress.rateLimitHits += 1;
        throw new RateLimitError(`호출 한도 초과 (HTTP ${res.status})`);
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        const errMsg = text.match(
          /<(returnAuthMsg|errMsg|resultMsg)>([^<]*)</,
        )?.[2];
        throw new Error(
          `비JSON 응답 (HTTP ${res.status}): ${errMsg ?? '알 수 없음'}`,
        );
      }

      // 키 미등록(SERVICE_KEY_IS_NOT_REGISTERED_ERROR), 게이트웨이 시간 초과(HTTP 504 SERVICETIMEOUT_ERROR) 등은
      // 이 형태로 옴 — 메시지만 꺼냄 (원문에 키가 섞일 수 있음)
      const gatewayError = json.OpenAPI_ServiceResponse?.cmmMsgHeader?.errMsg;
      if (gatewayError)
        throw new Error(`API 오류 (HTTP ${res.status}): ${gatewayError}`);
      if (json.header?.resultCode !== '00') {
        throw new Error(
          `resultCode ${json.header?.resultCode}: ${json.header?.resultMsg}`,
        );
      }

      return {
        totalCount: Number(json.body?.totalCount ?? 0),
        items: (json.body?.items ?? []) as TabooItem[],
        remaining:
          progress.lastRemaining === null
            ? null
            : Number(progress.lastRemaining),
      };
    } catch (err) {
      if (err instanceof RateLimitError || attempt >= MAX_RETRIES) throw err;
      progress.retries += 1;
      console.warn(
        `  page ${pageNo} 재시도 (${attempt + 1}/${MAX_RETRIES}): ${(err as Error).message}`,
      );
      await sleep(2000 * (attempt + 1));
    }
  }
}

function loadProgress(): { progress: Progress; hashes: Set<string> } {
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(HASH_FILE, '');
    return {
      progress: {
        startedAt: new Date().toISOString(),
        totalCountAtStart: null,
        totalPages: null,
        nextPage: 1,
        pageSizes: [],
        rowsReceived: 0,
        hashCount: 0,
        calls: 0,
        retries: 0,
        rateLimitHits: 0,
        requestMsTotal: 0,
        lastRemaining: null,
        aggregate: emptyAggregate(),
      },
      hashes: new Set(),
    };
  }

  const progress: Progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  // 해시를 쓴 뒤 진행 파일을 쓰기 전에 멈췄으면 그 페이지 해시가 남아 있으므로 진행 파일 기준으로 자름
  const lines = fs.readFileSync(HASH_FILE, 'utf8').split('\n').filter(Boolean);
  const kept = lines.slice(0, progress.hashCount);
  fs.writeFileSync(HASH_FILE, kept.length ? `${kept.join('\n')}\n` : '');
  console.log(
    `이어서 받기: page ${progress.nextPage}부터 (받은 행 ${progress.rowsReceived})`,
  );
  return { progress, hashes: new Set(kept) };
}

function saveProgress(progress: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
}

async function collect(serviceKey: string): Promise<CacheFile> {
  fs.mkdirSync(WORK_DIR, { recursive: true });
  const { progress, hashes } = loadProgress();
  const isResume = progress.nextPage > 1;
  let duplicateRows = progress.rowsReceived - progress.hashCount;
  let checkedRemaining = false;

  while (
    progress.totalPages === null ||
    progress.nextPage <= progress.totalPages
  ) {
    const pageNo = progress.nextPage;
    // 실패해도 호출·재시도 횟수가 남도록 저장 (이 페이지 집계는 아직 반영 전이라 상태가 맞음)
    const page = await fetchPage(serviceKey, pageNo, progress).catch((err) => {
      saveProgress(progress);
      throw err;
    });

    if (!checkedRemaining) {
      checkedRemaining = true;
      const pagesLeft =
        progress.totalPages === null
          ? Math.ceil(page.totalCount / NUM_OF_ROWS)
          : progress.totalPages - pageNo + 1;
      // 처음 시작은 1,600회, 이어 받기는 남은 페이지 + 여유 10회가 필요
      const needed = isResume ? pagesLeft + 10 : MIN_REMAINING_TO_START;
      if (page.remaining !== null && page.remaining < needed) {
        saveProgress(progress);
        throw new Error(
          `남은 호출 한도 ${page.remaining}회가 필요한 ${needed}회보다 적어 시작하지 않음`,
        );
      }
    }

    if (progress.totalCountAtStart === null) {
      progress.totalCountAtStart = page.totalCount;
      progress.totalPages = Math.ceil(page.totalCount / NUM_OF_ROWS);
    } else if (page.totalCount !== progress.totalCountAtStart) {
      saveProgress(progress);
      throw new Error(
        `수집 중 totalCount가 바뀜 (${progress.totalCountAtStart} → ${page.totalCount}, page ${pageNo}). 페이지가 밀렸을 수 있어 중단함. ${WORK_DIR}를 지우고 다시 실행`,
      );
    }

    const newHashes: string[] = [];
    for (const item of page.items) {
      const hash = createHash('md5')
        .update(JSON.stringify(item))
        .digest('base64');
      if (hashes.has(hash)) {
        duplicateRows += 1;
      } else {
        hashes.add(hash);
        newHashes.push(hash);
      }
      addItem(progress.aggregate, item);
    }
    if (newHashes.length)
      fs.appendFileSync(HASH_FILE, `${newHashes.join('\n')}\n`);

    progress.pageSizes[pageNo - 1] = page.items.length;
    progress.rowsReceived += page.items.length;
    progress.hashCount += newHashes.length;
    progress.nextPage += 1;
    saveProgress(progress);

    if (pageNo % 50 === 0 || pageNo === progress.totalPages) {
      const minutes = (
        (Date.now() - Date.parse(progress.startedAt)) /
        60000
      ).toFixed(1);
      console.log(
        `page ${pageNo}/${progress.totalPages} 행 ${progress.rowsReceived} · 호출 ${progress.calls} · 남은 한도 ${progress.lastRemaining} · ${minutes}분`,
      );
    }
    if (progress.nextPage <= progress.totalPages!)
      await sleep(REQUEST_DELAY_MS);
  }

  // 끝날 때 totalCount를 한 번 더 확인 (마지막 페이지 이후 바뀐 경우)
  const endCheck = await fetchPage(serviceKey, 1, progress).finally(() =>
    saveProgress(progress),
  );

  const totalCount = progress.totalCountAtStart!;
  const totalPages = progress.totalPages!;
  const expectedLast = totalCount - (totalPages - 1) * NUM_OF_ROWS;
  const badPages = progress.pageSizes
    .slice(0, -1)
    .map((size, index) => ({ page: index + 1, size }))
    .filter(({ size }) => size !== NUM_OF_ROWS);
  const lastSize = progress.pageSizes[totalPages - 1];
  const directed = Object.keys(progress.aggregate.directedPairs);
  const withoutReverse = directed.filter((pair) => {
    const [x, y] = pair.split('>');
    return !progress.aggregate.directedPairs[`${y}>${x}`];
  });

  const validations: Validation[] = [
    {
      name: '받은 행 수 = totalCount',
      passed: progress.rowsReceived === totalCount,
      detail: `${progress.rowsReceived} / ${totalCount}`,
    },
    {
      name: `마지막 페이지 제외 모두 ${NUM_OF_ROWS}건`,
      passed: badPages.length === 0 && progress.pageSizes.length === totalPages,
      detail: badPages.length
        ? `어긋난 페이지 ${badPages.length}개: ${JSON.stringify(badPages.slice(0, 5))}`
        : `${totalPages - 1}페이지 모두 ${NUM_OF_ROWS}건`,
    },
    {
      name: '마지막 페이지 건수 = 계산값',
      passed: lastSize === expectedLast,
      detail: `${lastSize} / ${expectedLast}`,
    },
    {
      name: '시작과 끝 totalCount 같음',
      passed: endCheck.totalCount === totalCount,
      detail: `${totalCount} → ${endCheck.totalCount}`,
    },
    {
      name: '완전히 같은 행 0건',
      passed: duplicateRows === 0,
      detail: `${duplicateRows}건`,
    },
    {
      name: '반대 방향 없는 성분 쌍 0개',
      passed: withoutReverse.length === 0,
      detail: `방향 쌍 ${directed.length}개 중 ${withoutReverse.length}개`,
    },
    {
      name: '필수 필드 빠진 행 0건',
      passed: progress.aggregate.missingFieldRows === 0,
      detail: `${progress.aggregate.missingFieldRows}건`,
    },
  ];

  const agg = progress.aggregate;
  const cache: CacheFile = {
    createdAt: new Date().toISOString(),
    totalCount,
    fetch: {
      startedAt: progress.startedAt,
      finishedAt: new Date().toISOString(),
      calls: progress.calls,
      retries: progress.retries,
      rateLimitHits: progress.rateLimitHits,
      requestMsTotal: progress.requestMsTotal,
      lastRemaining: progress.lastRemaining,
    },
    validations,
    ingredients: Object.keys(agg.korNames)
      .sort()
      .map((code) => ({
        ingr_code: code,
        name_kor: mostFrequent(agg.korNames[code])!,
        name_eng: mostFrequent(agg.engNames[code]),
      })),
    rules: Object.keys(agg.rules)
      .sort()
      .map((key) => {
        const [a, b, ...rest] = key.split('|');
        return { ingr_code_a: a, ingr_code_b: b, reason: rest.join('|') };
      }),
    itemIngredients: Object.keys(agg.itemIngredients)
      .sort()
      .map((key) => {
        const [itemSeq, code] = key.split('|');
        return { item_seq: itemSeq, ingr_code: code };
      }),
    maxReasonBytes: agg.maxReasonBytes,
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
  console.log(`\n집계 캐시 저장: ${CACHE_FILE}`);
  return cache;
}

async function loadMedicineIds(supabase: ReturnType<typeof createAdminClient>) {
  const bySeq = new Map<string, string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('medicines')
      .select('id, item_seq')
      .order('id')
      .range(from, from + 999);
    if (error) throw new Error(`medicines 조회 실패: ${error.message}`);
    for (const row of data) bySeq.set(row.item_seq, row.id);
    if (data.length < 1000) break;
  }
  return bySeq;
}

async function upsertChunks(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  rows: object[],
  onConflict: string,
) {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK_SIZE);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) {
      throw new Error(
        `${table} upsert 실패 (${i + 1}~${i + chunk.length}번째): ${error.message}`,
      );
    }
  }
  console.log(`  ${table} upsert ${rows.length}건`);
}

// 이번 실행 시각보다 오래된 행 = 이번 집계에 없는 행 (DUR에서 빠졌거나 medicines에서 사라진 약)
async function countStale(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  syncedAt: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .lt('synced_at', syncedAt);
  if (error) throw new Error(`${table} 정리 대상 조회 실패: ${error.message}`);
  return count ?? 0;
}

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table} 건수 조회 실패: ${error.message}`);
  return count ?? 0;
}

const TABLES_IN_DELETE_ORDER = [
  'dur_contraindication_rules',
  'medicine_ingredients',
  'dur_ingredients',
] as const;

async function main() {
  const { dryRun, fromCache, expect } = parseArgs();

  let cache: CacheFile;
  if (fromCache) {
    if (!fs.existsSync(CACHE_FILE)) {
      console.error(
        `캐시 파일이 없습니다: ${CACHE_FILE}\n먼저 --dry-run으로 전체 수집을 실행해주세요.`,
      );
      process.exit(1);
    }
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log(`캐시 사용: ${CACHE_FILE} (생성 ${cache.createdAt})`);
  } else {
    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) {
      console.error('DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.');
      process.exit(1);
    }
    try {
      cache = await collect(serviceKey);
    } catch (err) {
      console.error('\n수집 중단:', (err as Error).message);
      console.error(
        `진행 파일: ${PROGRESS_FILE} (같은 명령으로 이어서 받음). DB에는 아무것도 쓰지 않았습니다.`,
      );
      process.exit(1);
    }
  }

  const supabase = createAdminClient();
  const medicineIds = await loadMedicineIds(supabase);
  const medicineIngredients = cache.itemIngredients
    .filter(({ item_seq }) => medicineIds.has(item_seq))
    .map(({ item_seq, ingr_code }) => ({
      medicine_id: medicineIds.get(item_seq)!,
      ingr_code,
    }));
  const ourMedicineCount = new Set(
    medicineIngredients.map((row) => row.medicine_id),
  ).size;

  const fetchMinutes =
    (Date.parse(cache.fetch.finishedAt) - Date.parse(cache.fetch.startedAt)) /
    60000;
  console.log('\n=== 수집 ===');
  console.log(
    `호출 ${cache.fetch.calls}회 · 재시도 ${cache.fetch.retries}회 · 한도 초과 ${cache.fetch.rateLimitHits}회 · ` +
      `소요 ${fetchMinutes.toFixed(1)}분(응답 대기 ${(cache.fetch.requestMsTotal / 60000).toFixed(1)}분) · 남은 한도 ${cache.fetch.lastRemaining}`,
  );

  const validations = [...cache.validations];
  if (expect) {
    const [ingredients, rules, medicines] = expect;
    validations.push({
      name: `건수 기대값 ${expect.join('/')}`,
      passed:
        cache.ingredients.length === ingredients &&
        cache.rules.length === rules &&
        ourMedicineCount === medicines,
      detail: `성분 ${cache.ingredients.length} / 조합 ${cache.rules.length} / 우리 약 ${ourMedicineCount}`,
    });
  }

  console.log('\n=== 검증 ===');
  for (const v of validations) {
    console.log(`${v.passed ? '통과' : '실패'}  ${v.name} — ${v.detail}`);
  }
  const allPassed = validations.every((v) => v.passed);

  console.log('\n=== 집계 ===');
  console.log(
    `성분 ${cache.ingredients.length} · 조합 ${cache.rules.length} · DUR 품목↔성분 ${cache.itemIngredients.length}`,
  );
  console.log(
    `우리 약↔성분 ${medicineIngredients.length}행 (우리 약 ${ourMedicineCount}건 / medicines ${medicineIds.size}건)`,
  );
  console.log(
    `사유 최대 길이 ${cache.maxReasonBytes}바이트, 빈 사유 조합 ${cache.rules.filter((r) => !r.reason).length}개`,
  );

  const syncedAt = new Date().toISOString();
  if (dryRun) {
    console.log('\n=== 현재 DB (정리 대상 = 이번 실행 시각보다 오래된 행) ===');
    for (const table of TABLES_IN_DELETE_ORDER) {
      console.log(
        `  ${table}: ${await countRows(supabase, table)}행, 정리 대상 ${await countStale(supabase, table, syncedAt)}행`,
      );
    }
    console.log(
      `\n[dry-run] DB에는 아무것도 쓰지 않았습니다. ${allPassed ? '검증 통과' : '검증 실패'}`,
    );
    return;
  }

  if (!allPassed) {
    console.error('\n검증을 통과하지 못해 저장하지 않습니다.');
    process.exit(1);
  }

  // 3) 저장: 성분 → 조합 → 약↔성분. synced_at은 default now()가 insert에만 적용되므로 직접 넣어 갱신
  console.log(`\n=== 저장 (synced_at ${syncedAt}) ===`);
  try {
    await upsertChunks(
      supabase,
      'dur_ingredients',
      cache.ingredients.map((row) => ({ ...row, synced_at: syncedAt })),
      'ingr_code',
    );
    await upsertChunks(
      supabase,
      'dur_contraindication_rules',
      cache.rules.map((row) => ({ ...row, synced_at: syncedAt })),
      'ingr_code_a,ingr_code_b,reason',
    );
    await upsertChunks(
      supabase,
      'medicine_ingredients',
      medicineIngredients.map((row) => ({ ...row, synced_at: syncedAt })),
      'medicine_id,ingr_code',
    );
  } catch (err) {
    console.error('\n', (err as Error).message);
    console.error(
      '정리 단계는 실행하지 않았습니다. 다시 실행하면 같은 키로 덮어쓰므로 안전합니다.',
    );
    process.exit(1);
  }

  // 4) 정리: 대상 건수를 먼저 출력하고 조합 → 약↔성분 → 성분 순서로 삭제
  console.log('\n=== 정리 (이번 실행 시각보다 오래된 행) ===');
  for (const table of TABLES_IN_DELETE_ORDER) {
    const stale = await countStale(supabase, table, syncedAt);
    console.log(`  ${table}: 정리 대상 ${stale}행`);
    if (stale === 0) continue;
    const { error } = await supabase
      .from(table)
      .delete()
      .lt('synced_at', syncedAt);
    if (error) {
      console.error(`  ${table} 정리 실패: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n=== 저장 후 DB 건수 ===');
  for (const table of TABLES_IN_DELETE_ORDER) {
    console.log(`  ${table}: ${await countRows(supabase, table)}행`);
  }
}

main();
