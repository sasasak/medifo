'use client';

import Input from '@/components/ui/Input';
import Link from 'next/link';
import { Pill } from 'lucide-react';
import { demoLoginAction, loginAction } from './loginAction';
import { Suspense, useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [state, formAction, isLoginPending] = useActionState(loginAction, null);
  const [demoState, demoFormAction, isDemoPending] = useActionState(
    demoLoginAction,
    null,
  );
  // 한쪽 로그인이 진행 중이면 두 버튼을 모두 막음
  const isPending = isLoginPending || isDemoPending;
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <section className="m-auto w-full max-w-md px-6">
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div className="bg-button flex aspect-square w-20 items-center justify-center rounded-full text-4xl">
          <Pill size={35} className="text-text-reverse-base" />
        </div>
        <h1 className="sr-only">로그인 페이지입니다.</h1>
        <h2 className="text-text-base text-3xl">Medifo</h2>
        <p className="text-text-muted text-sm">건강한 복약 관리의 시작</p>
      </div>
      <form
        action={formAction}
        noValidate
        className="bg-card text-text-base flex flex-col gap-5 rounded-2xl p-5"
      >
        <input type="hidden" name="redirect" value={redirectTo} />
        <Input
          id="email"
          type="email"
          label="이메일 "
          placeholder="example@email.com"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={state?.errors?.email}
        />
        <Input
          id="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state?.errors?.password}
        />
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isLoginPending}
          className="bg-button text-text-reverse-base hover:bg-hover-color h-14 w-full cursor-pointer rounded-4xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoginPending ? '로그인 중 ... ' : '로그인'}
        </button>
      </form>
      {/* 이메일·비밀번호 입력에서 Enter를 누르면 위 폼만 제출되도록 폼을 나눔 */}
      <form action={demoFormAction} className="mt-4 flex flex-col gap-2">
        <input type="hidden" name="redirect" value={redirectTo} />
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isDemoPending}
          className="border-card-border bg-card text-text-base hover:bg-card-muted h-14 w-full cursor-pointer rounded-4xl border disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDemoPending
            ? '체험 계정으로 로그인 중 ... '
            : '체험 계정으로 둘러보기'}
        </button>
        {demoState?.error && (
          <p role="alert" className="text-danger-400 text-center text-sm">
            {demoState.error}
          </p>
        )}
      </form>
      <p className="text-text-muted mt-6 flex items-center justify-center gap-1 text-center text-sm">
        아직 계정이 없으신가요?
        <Link href="/signup" className="text-text-hint font-bold">
          회원가입
        </Link>
      </p>
    </section>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
