'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const logoutAction = async () => {
  const supabase = await createClient();
  // 기본값(global)은 같은 계정의 모든 세션을 끊으므로 이 브라우저 세션만 끊음
  // (체험 계정을 여러 사람이 함께 쓰기 때문)
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
};
