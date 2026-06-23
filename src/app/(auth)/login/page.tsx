import Input from '@/components/ui/Input'
import Link from 'next/link'
import { Pill } from 'lucide-react'

export default function Login() {
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
      <form className="bg-card text-text-base flex flex-col gap-5 rounded-2xl p-5">
        <Input
          id="email"
          type="email"
          label="이메일 "
          placeholder="example@email.com"
        />
        <Input
          id="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
        />
        <button
          type="submit"
          className="bg-button text-text-reverse-base hover:bg-hover-color h-14 w-full cursor-pointer rounded-4xl"
        >
          로그인
        </button>
      </form>
      <p className="text-text-muted mt-6 flex items-center justify-center gap-1 text-center text-sm">
        아직 계정이 없으신가요?
        <Link href="/signup" className="text-text-hint font-bold">
          회원가입
        </Link>
      </p>
    </section>
  )
}
