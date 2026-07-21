'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const loginAction = async (_: unknown, formData: FormData) => {
  console.log('loginAction 호출됨', formData.get('email')); // 임시 디버깅

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
  redirect('/home');
};
