'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import MedicineCard from './MedicineCard';

interface SearchResultsProps {
  query: string;
}

type Medicine = {
  id: string;
  name: string;
  manufacturer: string | null;
  efficacy: string | null;
  image_url: string | null;
};

// 짧은 검색어(예: "정")로 수천 건이 내려오는 것을 막기 위한 상한 (페이지네이션은 별도 작업)
const SEARCH_RESULT_LIMIT = 50;

export default function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<Medicine[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data, count } = await supabase
        .from('medicines')
        .select('id, name, manufacturer, efficacy, image_url', {
          count: 'exact',
        })
        .ilike('name', `%${query}%`)
        // TODO: 테스트 데이터 5건(synced_at 없음) 정리 후 이 조건 제거
        .not('synced_at', 'is', null)
        .order('name')
        .limit(SEARCH_RESULT_LIMIT);

      if (data) {
        setResults(data);
        setTotalCount(count ?? data.length);
      }
      setIsLoading(false);
    };
    fetchResults();
  }, [query]);

  if (isLoading) return <p className="text-text-muted text-sm">검색 중 ...</p>;

  return (
    <div>
      <p>
        {totalCount}건의 결과
        {totalCount > results.length && (
          <span className="text-text-muted text-sm">
            {' '}
            (상위 {results.length}건만 표시)
          </span>
        )}
      </p>
      <div className="py-3">
        {results.length === 0 ? (
          <p>검색 결과가 존재하지 않습니다.</p>
        ) : (
          results.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              id={medicine.id}
              name={medicine.name}
              manufacturer={medicine.manufacturer}
              efficacy={medicine.efficacy}
              imageUrl={medicine.image_url}
            />
          ))
        )}
      </div>
    </div>
  );
}
