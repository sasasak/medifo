import type { createClient } from '@/utils/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface ContraindicationPartner {
  code: string;
  name: string;
  // 같은 짝 성분에 사유가 여러 개일 수 있음. 빈 문자열은 DUR 원문에 사유가 없는 조합
  reasons: string[];
}

export interface IngredientContraindications {
  code: string;
  name: string;
  partners: ContraindicationPartner[];
}

export type ContraindicationInfo =
  | {
      status: 'ok';
      ingredients: IngredientContraindications[];
      // DUR 데이터를 저장한 연·월 (예: "2026년 11월"). 조합 테이블이 비어 있으면 null
      baseMonth: string | null;
    }
  | { status: 'error' };

interface RuleRow {
  reason: string;
  partner: { ingr_code: string; name_kor: string } | null;
}

interface IngredientRow {
  ingr_code: string;
  ingredient: {
    name_kor: string;
    rules_as_a: RuleRow[];
    rules_as_b: RuleRow[];
  } | null;
}

// 조합은 ingr_code_a < ingr_code_b 한 방향으로만 저장되어 있어
// 이 약의 성분이 a인 조합과 b인 조합을 각각 불러와 상대 성분을 짝으로 모은다
const INGREDIENT_SELECT = `ingr_code, ingredient:dur_ingredients(name_kor,
  rules_as_a:dur_contraindication_rules!ingr_code_a(reason, partner:dur_ingredients!ingr_code_b(ingr_code, name_kor)),
  rules_as_b:dur_contraindication_rules!ingr_code_b(reason, partner:dur_ingredients!ingr_code_a(ingr_code, name_kor)))`;

const baseMonthFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
});

function toPartners(rules: RuleRow[]): ContraindicationPartner[] {
  const byCode = new Map<string, ContraindicationPartner>();
  for (const { reason, partner } of rules) {
    if (!partner) continue;
    const existing = byCode.get(partner.ingr_code);
    if (existing) {
      existing.reasons.push(reason);
    } else {
      byCode.set(partner.ingr_code, {
        code: partner.ingr_code,
        name: partner.name_kor,
        reasons: [reason],
      });
    }
  }
  return [...byCode.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'ko'),
  );
}

// 약 하나의 성분과, 그 성분이 식약처 DUR에서 병용금기로 지정된 짝 성분 목록을 불러온다
// 읽기 전용 공개 데이터라 로그인 사용자 권한(publishable 키)으로 조회한다
export async function getContraindicationInfo(
  supabase: SupabaseServerClient,
  medicineId: string,
): Promise<ContraindicationInfo> {
  const [ingredientResult, syncedResult] = await Promise.all([
    supabase
      .from('medicine_ingredients')
      .select(INGREDIENT_SELECT)
      .eq('medicine_id', medicineId),
    supabase
      .from('dur_contraindication_rules')
      .select('synced_at')
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (ingredientResult.error || syncedResult.error) {
    console.error(
      '병용금기 성분 정보 조회 실패',
      ingredientResult.error ?? syncedResult.error,
    );
    return { status: 'error' };
  }

  const rows = (ingredientResult.data ?? []) as unknown as IngredientRow[];
  const ingredients = rows
    .filter((row) => row.ingredient)
    .map((row) => ({
      code: row.ingr_code,
      name: row.ingredient!.name_kor,
      partners: toPartners([
        ...row.ingredient!.rules_as_a,
        ...row.ingredient!.rules_as_b,
      ]),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const syncedAt = syncedResult.data?.synced_at as string | undefined;

  return {
    status: 'ok',
    ingredients,
    baseMonth: syncedAt ? baseMonthFormatter.format(new Date(syncedAt)) : null,
  };
}
