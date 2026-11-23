import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { MIN_USERS, POPULAR_REVALIDATE_SECONDS } from '@/utils/popularRanking';

const POPULAR_KEYWORD_COUNT = 8;

// 집계 결과가 8개보다 적을 때 채우는 대체 목록
// 같은 브랜드에 제품이 여러 개라(예: 타이레놀 7건) 제품 하나가 아닌 키워드로 검색 결과를 보여준다.
// 수집 데이터 기준 검색 결과가 4건 이상인 브랜드로 선정
const POPULAR_KEYWORDS = [
  '아로나민',
  '타이레놀',
  '탁센',
  '판콜',
  '우루사',
  '게보린',
  '판피린',
  '후시딘',
];

// get_popular_search_terms는 service_role에만 실행 권한이 있어 admin 클라이언트로 호출한다.
// 쿠키를 읽지 않으므로 캐시 함수 안에서 쓸 수 있다.
// 실패하면 throw해서 실패 결과가 캐시에 남지 않게 한다.
const fetchAggregatedKeywords = unstable_cache(
  async (minUsers: number): Promise<string[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_popular_search_terms', {
      p_limit: POPULAR_KEYWORD_COUNT,
      p_min_users: minUsers,
    });

    if (error) throw error;
    return (data as { term: string }[]).map((row) => row.term);
  },
  ['popular-search-terms'],
  { revalidate: POPULAR_REVALIDATE_SECONDS },
);

// 검색한 사용자 수 기준 인기 검색어를 앞에 두고, 남은 자리는 대체 목록으로 채운다 (중복 제외).
export async function getPopularKeywords(): Promise<string[]> {
  const aggregated = await fetchAggregatedKeywords(MIN_USERS).catch(
    (error): string[] => {
      console.error(error);
      return [];
    },
  );

  const fallback = POPULAR_KEYWORDS.filter(
    (keyword) => !aggregated.includes(keyword),
  );
  return [...aggregated, ...fallback].slice(0, POPULAR_KEYWORD_COUNT);
}
