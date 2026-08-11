'use client';

import { createClient } from '@/utils/supabase/client';
import { Clock, X } from 'lucide-react';
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

type RecentSearch = { id: string; term: string };

interface RecentSearchesProps {
  userId: string;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  refetchRef: RefObject<(() => void) | null>;
}

export default function RecentSearches({
  userId,
  setQuery,
  refetchRef,
}: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const fetchRecentSearches = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('user_search_history')
      .select('id, term')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentSearches(data.map((item) => ({ id: item.id, term: item.term })));
    }
  };

  useEffect(() => {
    fetchRecentSearches();
    refetchRef.current = fetchRecentSearches;
  }, [userId]);

  const handleDeleteAll = async () => {
    const supabase = createClient();
    await supabase.from('user_search_history').delete().eq('user_id', userId);
    setRecentSearches([]);
  };

  const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const supabase = createClient();
    await supabase.from('user_search_history').delete().eq('id', id);
    setRecentSearches((prev) => prev.filter((s) => s.id !== id));
  };

  // return 안에서 조건부로 보여주기
  return (
    <div>
      {recentSearches.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-text-muted" />
              <span className="text-sm font-bold">최근 검색어</span>
            </div>
            <button
              type="button"
              onClick={handleDeleteAll}
              className="text-text-muted cursor-pointer text-xs"
            >
              전체 삭제
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuery(item.term)}
                className="bg-card border-border-light text-text-muted flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-sm"
              >
                {item.term}
                <X size={12} onClick={(e) => handleDeleteOne(e, item.id)} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
