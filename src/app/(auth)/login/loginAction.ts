'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/schemas/loginSchema';
import { toFieldErrors } from '@/schemas/zodErrors';
import { getDemoCredentials } from '@/utils/demoAccount';

type LoginErrors = {
  email?: string;
  password?: string;
};

export type LoginActionState = {
  errors: LoginErrors;
} | null;

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
  const redirectTo = formData.get('redirect') as string | null;

  const parsed = loginSchema.safeParse({
    email: (formData.get('email') as string) ?? '',
    password: (formData.get('password') as string) ?? '',
  });

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;

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

export type DemoLoginActionState = { error: string } | null;

const DEMO_LOGIN_ERROR =
  '체험 계정으로 로그인하지 못했어요. 잠시 후 다시 시도해주세요.';

export const demoLoginAction = async (
  _: DemoLoginActionState,
  formData: FormData,
): Promise<DemoLoginActionState> => {
  const redirectTo = formData.get('redirect') as string | null;

  // 환경변수가 없을 때도 같은 문구만 보여주고 변수 이름은 노출하지 않음
  const credentials = getDemoCredentials();
  if (!credentials) {
    return { error: DEMO_LOGIN_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: DEMO_LOGIN_ERROR };
  }

  redirect(isSafeRedirectPath(redirectTo) ? redirectTo : '/home');
};
