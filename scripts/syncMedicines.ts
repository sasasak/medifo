/**
 * 1회성 수집 스크립트 — 식약처 의약품개요정보(e약은요) → medicines 테이블
 *
 * 전체를 먼저 수집해 item_seq 중복을 정리한 뒤 item_seq(품목기준코드) 기준으로 upsert하므로
 * 재실행해도 안전하다. 기존 행의 id는 유지되므로 user_medicines 참조나 /medicine/[id] 링크가 깨지지 않는다.
 *
 * 실행:
 *   소량 점검 (DB 쓰기 없음): npx tsx --env-file=.env.local scripts/syncMedicines.ts --dry-run --rows=25 --pages=1 [--start-page=96]
 *   전체 수집:                npx tsx --env-file=.env.local scripts/syncMedicines.ts
 *
 * ⚠️ DATA_GO_KR_SERVICE_KEY는 Encoding 키라 URL에 그대로 붙인다.
 *    URLSearchParams / encodeURIComponent를 거치면 이중 인코딩되어 인증 에러가 난다.
 */
import { createAdminClient } from '../src/utils/supabase/admin';

const ENDPOINT =
  'https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';
const REQUEST_DELAY_MS = 200;
const MAX_RETRIES = 2;
const UPSERT_CHUNK_SIZE = 500;

interface EasyDrugItem {
  entpName: string | null;
  itemName: string | null;
  itemSeq: string | null;
  efcyQesitm: string | null;
  useMethodQesitm: string | null;
  atpnWarnQesitm: string | null;
  atpnQesitm: string | null;
  intrcQesitm: string | null;
  seQesitm: string | null;
  depositMethodQesitm: string | null;
  openDe: string | null;
  updateDe: string | null;
  itemImage: string | null;
}

interface EasyDrugPage {
  totalCount: number;
  items: EasyDrugItem[];
}

interface MedicineRow {
  item_seq: string;
  name: string;
  manufacturer: string | null;
  efficacy: string | null;
  usage: string | null;
  warnings: string | null;
  precautions: string | null;
  interactions: string | null;
  side_effects: string | null;
  storage: string | null;
  image_url: string | null;
  open_date: string | null;
  update_date: string | null;
  synced_at: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const getNumber = (name: string, fallback: number) => {
    const found = args.find((arg) => arg.startsWith(`--${name}=`));
    return found ? Number(found.split('=')[1]) : fallback;
  };

  return {
    dryRun: args.includes('--dry-run'),
    startPage: getNumber('start-page', 1),
    rows: getNumber('rows', 100),
    // 0이면 마지막 페이지까지
    pages: getNumber('pages', 0),
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(
  serviceKey: string,
  pageNo: number,
  numOfRows: number,
): Promise<EasyDrugPage> {
  const url = `${ENDPOINT}?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

  for (let attempt = 0; ; attempt += 1) {
    try {
      const res = await fetch(url);
      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        // 인증 에러 등은 XML로 내려옴 — 원문에 키가 섞일 수 있어 메시지 태그만 추출
        const errMsg = text.match(
          /<(returnAuthMsg|errMsg|resultMsg)>([^<]*)</,
        )?.[2];
        throw new Error(
          `비JSON 응답 (HTTP ${res.status}): ${errMsg ?? '알 수 없음'}`,
        );
      }

      if (json.header?.resultCode !== '00') {
        throw new Error(
          `resultCode ${json.header?.resultCode}: ${json.header?.resultMsg}`,
        );
      }

      return {
        totalCount: json.body?.totalCount ?? 0,
        items: json.body?.items ?? [],
      };
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      console.warn(`  page ${pageNo} 재시도 (${attempt + 1}/${MAX_RETRIES})`);
      await sleep(1000 * (attempt + 1));
    }
  }
}

function cleanText(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// 원문 일부가 "보관하십시오.어린이의"처럼 문장 사이 공백 없이 붙어 있어 줄바꿈을 넣어준다.
// 마침표 뒤에 한글이 바로 오는 경우만 대상이라 "2.5 mg" 같은 소수점은 영향 없음
function cleanParagraph(value: string | null): string | null {
  return cleanText(value)?.replace(/\.(?=[가-힣])/g, '.\n') ?? null;
}

// openDe는 "20210129", updateDe는 "2024-05-09"처럼 형식이 달라 숫자만 뽑아 정규화
function toDate(value: string | null): string | null {
  const digits = value?.replace(/\D/g, '');
  if (!digits || digits.length < 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function toRow(item: EasyDrugItem, syncedAt: string): MedicineRow | null {
  const itemSeq = cleanText(item.itemSeq);
  const name = cleanText(item.itemName);
  if (!itemSeq || !name) return null;

  return {
    item_seq: itemSeq,
    name,
    manufacturer: cleanText(item.entpName),
    efficacy: cleanParagraph(item.efcyQesitm),
    usage: cleanParagraph(item.useMethodQesitm),
    warnings: cleanParagraph(item.atpnWarnQesitm),
    precautions: cleanParagraph(item.atpnQesitm),
    interactions: cleanParagraph(item.intrcQesitm),
    side_effects: cleanParagraph(item.seQesitm),
    storage: cleanParagraph(item.depositMethodQesitm),
    image_url: cleanText(item.itemImage),
    open_date: toDate(item.openDe),
    update_date: toDate(item.updateDe),
    synced_at: syncedAt,
  };
}

// 중복 품목 중 남길 쪽: 이미지 있는 쪽 우선, 그다음 수정일자가 최신인 쪽
function isPreferred(candidate: MedicineRow, current: MedicineRow): boolean {
  if (!!candidate.image_url !== !!current.image_url) {
    return !!candidate.image_url;
  }
  return (candidate.update_date ?? '') > (current.update_date ?? '');
}

// 같은 품목이 이미지 유무만 다른 채로 두 번 내려오는 경우가 있어(예: 197100015) 하나만 남긴다.
// 한 upsert 배치에 같은 키가 두 번 있으면 Postgres 에러도 남
function dedupeRows(rows: MedicineRow[]): MedicineRow[] {
  const bySeq = new Map<string, MedicineRow>();
  for (const row of rows) {
    const existing = bySeq.get(row.item_seq);
    if (!existing || isPreferred(row, existing)) {
      bySeq.set(row.item_seq, row);
    }
  }
  return [...bySeq.values()];
}

// dry-run 전용: 응답 구조와 데이터 품질 요약
function printReport(items: EasyDrugItem[], rows: MedicineRow[]) {
  const fields = Object.keys(items[0] ?? {}) as (keyof EasyDrugItem)[];
  const htmlPattern = /<[a-zA-Z/][^>]*>|&[a-zA-Z#0-9]+;/;

  console.log(`\n=== 필드별 품질 (표본 ${items.length}건) ===`);
  console.log('필드                  빈값    HTML  길이(min/median/max)');
  for (const field of fields) {
    const values = items.map((item) => item[field]);
    const filled = values.filter((v): v is string => !!v?.trim());
    const lengths = filled.map((v) => v.length).sort((a, b) => a - b);
    const emptyRate = ((1 - filled.length / items.length) * 100).toFixed(0);
    const htmlCount = filled.filter((v) => htmlPattern.test(v)).length;
    const lengthSummary = lengths.length
      ? `${lengths[0]}/${lengths[Math.floor(lengths.length / 2)]}/${lengths.at(-1)}`
      : '-';
    console.log(
      `${field.padEnd(21)} ${`${emptyRate}%`.padStart(4)}  ${String(htmlCount).padStart(5)}  ${lengthSummary}`,
    );
  }

  const htmlSamples = items
    .flatMap((item) => fields.map((field) => item[field]))
    .filter((v): v is string => !!v && htmlPattern.test(v))
    .map((v) => v.match(htmlPattern)?.[0]);
  if (htmlSamples.length) {
    console.log(
      '\nHTML 태그/엔티티 예시:',
      [...new Set(htmlSamples)].slice(0, 10),
    );
  }

  const openDeFormats = new Set(
    items.map((item) => item.openDe?.replace(/\d/g, '9')),
  );
  const updateDeFormats = new Set(
    items.map((item) => item.updateDe?.replace(/\d/g, '9')),
  );
  console.log('\n날짜 형식 openDe:', [...openDeFormats]);
  console.log('날짜 형식 updateDe:', [...updateDeFormats]);

  const imageHosts = new Set(
    items
      .map((item) => item.itemImage)
      .filter((v): v is string => !!v)
      .map((v) => new URL(v).host),
  );
  console.log('이미지 도메인:', [...imageHosts]);

  const dedupedRows = dedupeRows(rows);
  console.log(
    `\n매핑 성공 ${rows.length}/${items.length}건, item_seq 중복 제거 후 ${dedupedRows.length}건`,
  );

  const preview = (value: string | null) =>
    value && value.length > 60 ? `${value.slice(0, 60)}…` : value;
  const withImage = dedupedRows.find((row) => row.image_url);
  const withoutImage = dedupedRows.find((row) => !row.image_url);
  console.log('\n=== 매핑된 row 샘플 (이미지 있음 / 없음) ===');
  for (const row of [withImage, withoutImage].filter((r) => r !== undefined)) {
    console.log(
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, preview(v as string | null)]),
      ),
    );
  }
}

async function main() {
  const { dryRun, startPage, rows: numOfRows, pages } = parseArgs();
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) {
    console.error('DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.');
    process.exit(1);
  }

  const syncedAt = new Date().toISOString();
  const collectedItems: EasyDrugItem[] = [];

  // 1) 수집: 페이지 간 중복까지 정리하려면 전체를 먼저 받아야 해서 DB 쓰기는 수집 후에 한다.
  //    전체 약 4,800건 = 100건씩 약 48회 호출이라 실패 시 처음부터 다시 받아도 트래픽 부담 없음
  let pageNo = startPage;
  let lastPage = Infinity;

  while (pageNo <= lastPage) {
    let page: EasyDrugPage;
    try {
      page = await fetchPage(serviceKey, pageNo, numOfRows);
    } catch (err) {
      console.error(`\npage ${pageNo} 수집 실패:`, (err as Error).message);
      console.error('DB에는 아무것도 쓰지 않았습니다. 다시 실행해주세요.');
      process.exit(1);
    }

    const totalPages = Math.ceil(page.totalCount / numOfRows);
    lastPage = pages ? Math.min(totalPages, startPage + pages - 1) : totalPages;
    collectedItems.push(...page.items);

    console.log(
      `page ${pageNo}/${totalPages} 수집 (${page.items.length}건, 전체 ${page.totalCount}건)`,
    );
    pageNo += 1;
    if (pageNo <= lastPage) await sleep(REQUEST_DELAY_MS);
  }

  const rows = collectedItems
    .map((item) => toRow(item, syncedAt))
    .filter((row): row is MedicineRow => row !== null);

  if (dryRun) {
    printReport(collectedItems, rows);
    console.log('\n[dry-run] DB에는 아무것도 쓰지 않았습니다.');
    return;
  }

  // 2) 저장: item_seq 기준 upsert라 중간에 실패해도 재실행하면 이어서 맞춰진다
  const supabase = createAdminClient();
  const dedupedRows = dedupeRows(rows);
  console.log(
    `\n수집 ${collectedItems.length}건 → 매핑 ${rows.length}건 → 중복 제거 ${dedupedRows.length}건`,
  );

  for (let i = 0; i < dedupedRows.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = dedupedRows.slice(i, i + UPSERT_CHUNK_SIZE);
    const { error } = await supabase
      .from('medicines')
      .upsert(chunk, { onConflict: 'item_seq' });
    if (error) {
      console.error(
        `\nupsert 실패 (${i + 1}~${i + chunk.length}번째):`,
        error.message,
      );
      console.error('재실행하면 item_seq 기준으로 덮어쓰므로 안전합니다.');
      process.exit(1);
    }
    console.log(`upsert ${i + chunk.length}/${dedupedRows.length}`);
  }

  console.log(`\n완료: ${dedupedRows.length}건 upsert`);
}

main();
