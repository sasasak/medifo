'use client';

import { useState, useRef } from 'react';
import RecentSearches from './_components/RecentSearches';
import SearchBar from './_components/SearchBar';
import PopularMedicines from './_components/PopularMedicines';

interface SearchClientProps {
  userId: string;
}

export default function SearchClient({ userId }: SearchClientProps) {
  const [query, setQuery] = useState('');
  const refetchRef = useRef<(() => void) | null>(null);

  const handleSearch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    refetchRef.current?.();
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        query={query}
        setQuery={setQuery}
        userId={userId}
        onSearch={handleSearch}
      />
      <RecentSearches
        userId={userId}
        query={query}
        setQuery={setQuery}
        refetchRef={refetchRef}
      />
      <PopularMedicines />
      {query && <div>{/* 나중에 검색 결과 컴포넌트 */}</div>}
    </div>
  );
}
