'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RecentSearches from './_components/RecentSearches';
import SearchBar from './_components/SearchBar';
import PopularMedicines from './_components/PopularMedicines';
import SearchResults from './_components/SearchResults';

interface SearchClientProps {
  userId: string;
}

export default function SearchClient({ userId }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 입력창 텍스트 - 로컬 상태 (뒤로가기 시 URL의 검색어 반영)
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  // 실제 검색된 텍스트 - URL 쿼리
  const searchedQuery = searchParams.get('q') ?? '';

  const refetchRef = useRef<(() => void) | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    refetchRef.current?.();
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      router.replace('/search');
    }
  };

  const handleSelectRecentTerm = (term: string) => {
    setQuery(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        query={query}
        setQuery={handleQueryChange}
        userId={userId}
        onSearch={handleSearch}
      />
      {searchedQuery ? (
        <SearchResults query={searchedQuery} />
      ) : (
        <>
          <RecentSearches
            userId={userId}
            query={query}
            setQuery={handleSelectRecentTerm}
            refetchRef={refetchRef}
          />
          <PopularMedicines />
        </>
      )}
    </div>
  );
}
