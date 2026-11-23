import { createClient } from '@/utils/supabase/server';
import SearchClient from './SearchClient';
import { getPopularKeywords } from './getPopularKeywords';

export default async function Search() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const popularKeywords = await getPopularKeywords();

  return (
    <div className="mx-6">
      <h2 className="mt-2 mb-10 text-2xl">약 검색</h2>
      <div>
        <SearchClient
          userId={user?.id ?? ''}
          popularKeywords={popularKeywords}
        />
      </div>
    </div>
  );
}
