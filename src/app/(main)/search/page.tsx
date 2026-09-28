import { createClient } from '@/utils/supabase/server';
import SearchClient from './SearchClient';

// 같은 브랜드에 제품이 여러 개라(예: 타이레놀 7건) 제품 하나가 아닌 키워드로 검색 결과를 보여준다.
// 수집 데이터 기준 검색 결과가 4건 이상인 브랜드로 선정
// TODO: 실제 서비스 데이터가 쌓이면 user_search_history.term 집계 기준 인기순으로 교체
// (검색 기록도 제품명이 아닌 키워드라 이 목록 형태를 그대로 쓸 수 있음)
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

export default async function Search() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-6">
      <h2 className="mt-2 mb-10 text-2xl">약 검색</h2>
      <div>
        <SearchClient
          userId={user?.id ?? ''}
          popularKeywords={POPULAR_KEYWORDS}
        />
      </div>
    </div>
  );
}
