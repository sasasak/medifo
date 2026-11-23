import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { MIN_USERS, POPULAR_REVALIDATE_SECONDS } from '@/utils/popularRanking';

// 카드 그리드(grid-cols-4) 한 줄에 맞춘 개수
const POPULAR_MEDICINE_COUNT = 4;

export interface PopularMedicine {
  id: string;
  name: string;
  precautions: string;
}

// get_popular_medicines는 service_role에만 실행 권한이 있어 admin 클라이언트로 호출한다.
// 쿠키를 읽지 않으므로 캐시 함수 안에서 쓸 수 있다.
// 실패하면 throw해서 실패 결과가 캐시에 남지 않게 한다.
const fetchAggregatedMedicines = unstable_cache(
  async (minUsers: number): Promise<PopularMedicine[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_popular_medicines', {
      p_limit: POPULAR_MEDICINE_COUNT,
      p_min_users: minUsers,
    });

    if (error) throw error;
    return (data as PopularMedicine[]).map(({ id, name, precautions }) => ({
      id,
      name,
      precautions,
    }));
  },
  ['popular-medicines'],
  { revalidate: POPULAR_REVALIDATE_SECONDS },
);

// 집계 결과가 4개보다 적을 때 채우는 대체 목록 (정렬 없이 주의사항이 있는 약 4개)
const fetchFallbackMedicines = unstable_cache(
  async (): Promise<PopularMedicine[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('medicines')
      .select('id, name, precautions')
      .not('precautions', 'is', null)
      .limit(POPULAR_MEDICINE_COUNT);

    if (error) throw error;
    return data;
  },
  ['popular-medicines-fallback'],
  { revalidate: POPULAR_REVALIDATE_SECONDS },
);

// 등록한 사용자 수 기준 인기 약을 앞에 두고, 남은 자리는 대체 목록으로 채운다 (같은 약 제외).
export async function getPopularMedicines(): Promise<PopularMedicine[]> {
  const [aggregated, fallback] = await Promise.all([
    fetchAggregatedMedicines(MIN_USERS).catch((error): PopularMedicine[] => {
      console.error(error);
      return [];
    }),
    fetchFallbackMedicines().catch((error): PopularMedicine[] => {
      console.error(error);
      return [];
    }),
  ]);

  const aggregatedIds = new Set(aggregated.map((medicine) => medicine.id));
  const rest = fallback.filter((medicine) => !aggregatedIds.has(medicine.id));
  return [...aggregated, ...rest].slice(0, POPULAR_MEDICINE_COUNT);
}
