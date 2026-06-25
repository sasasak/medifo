import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupSuccess() {
  return (
    <section className="text-text-base m-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <CheckCircle size={80} className="text-text-muted" />

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">회원가입이 완료되었습니다.</h1>
        <p className="text-text-muted text-lg">
          로그인하고 Medifo를 시작해보세요.
        </p>
      </div>
      <Link
        href="/login"
        className="bg-button text-text-reverse-base hover:bg-hover-color flex h-14 items-center justify-center rounded-4xl p-6"
      >
        로그인하러가기
      </Link>
    </section>
  );
}
