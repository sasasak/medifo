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
  manufacturer: string;
  efficacy: string;
};

export default function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('medicines')
        .select('id, name, manufacturer, efficacy')
        .ilike('name', `%${query}%`);

      if (data) setResults(data);
      setIsLoading(false);
    };
    fetchResults();
  }, [query]);

  if (isLoading) return <p className="text-text-muted text-sm">검색 중 ...</p>;

  return (
    <div>
      <p>{results.length}건의 결과</p>
      <div>
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
            />
          ))
        )}
      </div>
    </div>
  );
}
