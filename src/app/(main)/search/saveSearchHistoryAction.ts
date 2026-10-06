'use server';

import { createClient } from '@/utils/supabase/server';

// 검색 기록 저장. 같은 검색어가 이미 있으면 searched_at만 갱신해 최근 검색어 맨 앞으로 올린다.
// 검색 이동은 클라이언트의 router.push가 맡으므로 revalidatePath, redirect는 쓰지 않는다.
export const saveSearchHistoryAction = async (term: string) => {
  const trimmed = term.trim();
  if (!trimmed) return { error: '검색어가 비어 있습니다.' };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: '로그인 정보를 확인할 수 없습니다.' };
  }

  const { error } = await supabase.from('user_search_history').upsert(
    {
      user_id: user.id,
      term: trimmed,
      searched_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,term' },
  );

  if (error) {
    return { error: '검색 기록 저장에 실패했습니다.' };
  }

  return { error: null };
};
