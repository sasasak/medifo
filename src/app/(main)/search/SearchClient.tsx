'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RecentSearches from './_components/RecentSearches';
import SearchBar from './_components/SearchBar';
import PopularMedicines from './_components/PopularMedicines';
import SearchResults from './_components/SearchResults';

interface SearchClientProps {
  userId: string;
  popularKeywords: string[];
}

export default function SearchClient({
  userId,
  popularKeywords,
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 입력창 텍스트 - 로컬 상태 (뒤로가기 시 URL의 검색어 반영)
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  // 실제 검색된 텍스트 - URL 쿼리
  const searchedQuery = searchParams.get('q') ?? '';

  // 뒤로/앞으로 가기로 URL 검색어가 바뀌면 입력창도 맞춰준다.
  // effect 안에서 setState하면 연쇄 렌더가 생겨(react-hooks/set-state-in-effect) 렌더 중에 이전 값과 비교해 갱신
  const [prevSearchedQuery, setPrevSearchedQuery] = useState(searchedQuery);
  if (searchedQuery !== prevSearchedQuery) {
    setPrevSearchedQuery(searchedQuery);
    setQuery(searchedQuery);
  }

  // Enter 검색, 최근 검색어, 인기 키워드 모두 push로 기록을 남겨
  // 결과 화면에서 뒤로 가기 시 이전 검색이나 목록 화면으로 돌아오게 한다.
  // 지금 보고 있는 검색어와 같으면 기록이 중복으로 쌓이지 않게 건너뛴다.
  const navigateToQuery = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    if (trimmed === searchedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      router.replace('/search');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        query={query}
        setQuery={handleQueryChange}
        userId={userId}
        onSearch={() => navigateToQuery(query)}
      />
      {searchedQuery ? (
        <SearchResults query={searchedQuery} />
      ) : (
        <>
          <RecentSearches
            userId={userId}
            query={query}
            setQuery={navigateToQuery}
          />
          <PopularMedicines
            keywords={popularKeywords}
            onSelect={navigateToQuery}
          />
        </>
      )}
    </div>
  );
}
