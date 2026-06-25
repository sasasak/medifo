'use server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const signupAction = async (_: unknown, formData: FormData) => {
  // formData에서 값 꺼내기
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const nickname = formData.get('nickname') as string;

  // 비밀번호 정규식 (8자리 이상, 특수문자 하나 포함)
  const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  // 간단한 유효성 검사 - 추후 리팩토링 시 zod 로 교체
  if (!email || !password || !confirmPassword || !nickname) {
    return { error: '모든 항목을 입력해주세요' };
  }

  if (password !== confirmPassword) {
    return { error: '비밀번호가 일치하지 않습니다.' };
  }

  if (!passwordRegex.test(password)) {
    return {
      error: '비밀번호는 8자 이상, 특수문자를 1개 이상 포함해야 합니다. ',
    };
  }

  // 3. Supabase 클라이언트 생성
  const supabase = await createClient();

  // 4. supabase.auth.signUp() 호출
  const { data, error } = await supabase.auth.signUp({ email, password });

  // 5. 에러 처리
  if (error) {
    return { error: '회원가입에 실패했습니다. 다시 시도해주세요.' };
  }

  if (!data.user) {
    return { error: '사용자 정보를 생성하지 못했습니다.' };
  }

  // 6. public.users 테이블에 nickname 저장하기
  const { error: insertError } = await supabase.from('users').insert({
    id: data.user.id,
    email: email,
    nickname: nickname,
  });

  if (insertError) {
    return { error: '프로필 정보 저장에 실패했습니다.' };
  }

  // 7. 성공하면 리다이렉트
  redirect('/signup/success');
};

// 작성 후 해야할 것
/*
1. 연결된 page의 page.tsx에 useActionState 추가하기 + use client 추가 - useActionState 는 클라이언트에서 사용 가능 
const [state, formAction, isPending] = useActionState(signupAction, null)

2. <form> 에 action 연결 
<form action={formAction}>

+ input 에서 name 을 받도록 수정, formData.get('eamil')  로 값을 꺼내려면 input 에 name 이 있어야함 

3. 에러 메시지 표시 
{state?.error && <p className="text-red-500">{state.error}</p>}

4. 로딩 상태 표시 (선택)
<button type="submit" disabled={isPending}>
  {isPending ? "로그인 중..." : "로그인"}
</button>
*/
