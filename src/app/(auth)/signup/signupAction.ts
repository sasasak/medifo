'use server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signupSchema } from '@/schemas/signupSchema';
import { toFieldErrors } from '@/schemas/zodErrors';

type SignupErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
};

export type SignupActionState = {
  errors: SignupErrors;
} | null;

export const signupAction = async (
  _: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> => {
  // formData에서 값 꺼내기
  const parsed = signupSchema.safeParse({
    email: (formData.get('email') as string) ?? '',
    password: (formData.get('password') as string) ?? '',
    confirmPassword: (formData.get('confirmPassword') as string) ?? '',
    nickname: (formData.get('nickname') as string) ?? '',
  });

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  const { email, password, nickname } = parsed.data;

  // 3. Supabase 클라이언트 생성
  const supabase = await createClient();

  // 4. supabase.auth.signUp() 호출
  const { data, error } = await supabase.auth.signUp({ email, password });

  // 5. 에러 처리
  if (error) {
    return {
      errors: { email: '회원가입에 실패했습니다. 다시 시도해주세요.' },
    };
  }

  // 회원가입 시
  if (!data.user) {
    return { errors: { email: '사용자 정보를 생성하지 못했습니다.' } };
  }

  // 6. public.users 테이블에 nickname 저장하기
  const { error: insertError } = await supabase.from('users').insert({
    id: data.user.id,
    email: email,
    nickname: nickname,
  });

  if (insertError) {
    return { errors: { nickname: '프로필 정보 저장에 실패했습니다.' } };
  }

  // 7. 성공하면 리다이렉트
  redirect('/signup/success');
};
