'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

type LoginErrors = {
  email?: string;
  password?: string;
};

export type LoginActionState = {
  errors: LoginErrors;
} | null;

// 이메일 형식 검사용 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const loginAction = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirect') as string | null;

  // 필드별 유효성 검사 - 추후 리팩토링 시 zod 로 교체
  const errors: LoginErrors = {};

  if (!email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!emailRegex.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  if (!password) {
    errors.password = '비밀번호를 입력해주세요.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      errors: { password: '이메일과 비밀번호를 다시 확인해주세요.' },
    };
  }

  redirect(isSafeRedirectPath(redirectTo) ? redirectTo : '/home');
};
