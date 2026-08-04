'use client';

import { useState, useRef } from 'react';
import RecentSearches from './_components/RecentSearches';
import SearchBar from './_components/SearchBar';
import PopularMedicines from './_components/PopularMedicines';
import SearchResults from './_components/SearchResults';

interface SearchClientProps {
  userId: string;
}

export default function SearchClient({ userId }: SearchClientProps) {
  //  입력창에 입력 중인 텍스트
  const [query, setQuery] = useState('');
  // 검색(Enter)이 실제 실행된 텍스트
  const [searchedQuery, setSearchedQuery] = useState('');

  const refetchRef = useRef<(() => void) | null>(null);

  // 검색 실행(SearchBar 에서 Enter 입력 시 호출)
  const handleSearch = async () => {
    if (!query.trim()) return;
    // 최근 검색어 목록 갱신
    refetchRef.current?.();
    setSearchedQuery(query.trim()); // 검색 시점에 업데이트
  };

  // 최근 검색어 클릭 시 바로 검색되도록 처리
  const handleSelectRecentTerm = (term: string) => {
    setQuery(term);
    setSearchedQuery(term);
  };

  // 입력창 텍스트 변경 감지(다 지웠을 때 메인 화면으로 복귀)
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setSearchedQuery('');
    }
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
            setQuery={setQuery}
            refetchRef={refetchRef}
          />
          <PopularMedicines />
        </>
      )}
    </div>
  );
}
