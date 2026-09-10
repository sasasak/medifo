'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// 미들웨어가 붙여준 redirect 값이 외부 URL(//evil.com, /\evil.com 등)로
// 조작되지 않았는지 확인 - 내부 상대 경로일 때만 허용
function isSafeRedirectPath(path: string | null): path is string {
  return (
    !!path &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/\\')
  );
}

export const loginAction = async (_: unknown, formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirect') as string | null;

  // 간단한 유효성 검사 - 추후 리팩토링 시 zod 로 교체
  if (!email || !password) {
    return { error: '모든 항목을 입력해주세요.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: '이메일과 비밀번호를 다시 확인해주세요.' };
  }

  redirect(isSafeRedirectPath(redirectTo) ? redirectTo : '/home');
};
