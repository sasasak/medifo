'use client';

import { useRef, useState } from 'react';
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

  // push로 기록을 남겨 결과 화면에서 뒤로 가기 시 인기 목록으로 돌아오게 한다
  const handleSelectPopularKeyword = (keyword: string) => {
    setQuery(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
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
          <PopularMedicines
            keywords={popularKeywords}
            onSelect={handleSelectPopularKeyword}
          />
        </>
      )}
    </div>
  );
}
