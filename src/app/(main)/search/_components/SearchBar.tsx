'use client';

import { createClient } from '@/utils/supabase/client';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  userId: string;
  onSearch: () => void;
}

export default function SearchBar({
  query,
  setQuery,
  userId,
  onSearch,
}: SearchBarProps) {
  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    const supabase = createClient();
    await supabase.from('user_search_history').insert({
      user_id: userId,
      term: term.trim(),
      searched_at: new Date().toISOString(),
    });
  };

  return (
    <div className="relative flex items-center">
      <Search size={18} className="text-text-muted absolute left-4" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(query);
            onSearch();
          }
        }}
        placeholder="약 이름을 검색하세요"
        className="bg-card border-border-light focus:border-border-focus w-full rounded-2xl border py-3 pr-10 pl-10 text-sm outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-4 cursor-pointer"
        >
          <X size={18} className="text-text-muted" />
        </button>
      )}
    </div>
  );
}
