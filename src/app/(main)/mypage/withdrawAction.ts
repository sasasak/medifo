'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';

export const withdrawAction = async () => {
  const supabase = await createClient();

  // 1. 현재 로그인한 유저 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: '로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.' };
  }

  const userId = user.id;

  // 2. user_medicines 삭제 (intake_logs는 CASCADE로 자동 삭제됨)
  const { error: medicinesError } = await supabase
    .from('user_medicines')
    .delete()
    .eq('user_id', userId);

  if (medicinesError) {
    return { error: '복용 정보 삭제에 실패했습니다. 다시 시도해주세요.' };
  }

  // 3. user_search_history 삭제
  const { error: historyError } = await supabase
    .from('user_search_history')
    .delete()
    .eq('user_id', userId);

  if (historyError) {
    return { error: '검색 기록 삭제에 실패했습니다. 다시 시도해주세요.' };
  }

  // 4. public.users 삭제
  const { error: usersError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (usersError) {
    return { error: '회원 정보 삭제에 실패했습니다. 다시 시도해주세요.' };
  }

  // 5. auth.users 삭제 (service_role 필요 — admin 클라이언트로만 가능)
  const adminClient = createAdminClient();
  const { error: authDeleteError } =
    await adminClient.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    // 여기서 실패하면 public 데이터는 이미 지워졌지만 로그인 계정은 남아있는
    // 불일치 상태가 됨. 운영 환경이면 별도 로깅/알림 처리가 필요함.
    return {
      error: '계정 삭제 중 문제가 발생했습니다. 고객센터에 문의해주세요.',
    };
  }

  // 6. 세션 정리 후 리다이렉트
  await supabase.auth.signOut();
  redirect('/login');
};
