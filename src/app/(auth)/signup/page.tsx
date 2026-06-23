'use client'

import Input from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Signup() {
  return (
    <section className="m-auto w-full max-w-md px-6">
      <ThemeToggle />
      <div className="flex items-center gap-5 py-10">
        <Link href="/login">
          <ArrowLeft size={30} className="text-text-base" />
        </Link>
        <h1 className="text-text-base text-2xl">회원가입</h1>
      </div>
      <form className="bg-card text-text-base flex flex-col gap-5 rounded-2xl p-5">
        <Input
          id="email"
          type="email"
          label="이메일"
          placeholder="example@email.com"
        />
        <Input
          id="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
        />
        <Input
          id="password"
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력해주세요."
        />
        <button
          type="submit"
          className="bg-button text-text-reverse-base hover:bg-hover-color h-14 w-full cursor-pointer rounded-4xl"
        >
          회원가입
        </button>
      </form>
      <p className="text-text-muted mt-6 flex items-center justify-center gap-1 text-center text-sm">
        이미 계정이 있으신가요?
        <Link href="/signup" className="text-text-hint font-bold">
          로그인
        </Link>
      </p>
    </section>
  )
}
