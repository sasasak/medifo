"use client";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Pill } from "lucide-react";

export default function Login() {
  return (
    <section className="m-auto w-full max-w-md px-6">
      <ThemeToggle />
      <div className="flex flex-col justify-center items-center gap-3 py-12">
        <div className="bg-button w-20 aspect-square rounded-full flex justify-center items-center text-4xl">
          <Pill size={35} className="text-text-reverse-base" />
        </div>
        <h1 className="sr-only">로그인 페이지입니다.</h1>
        <h2 className="text-4xl text-text-base">Medifo</h2>
        <p className="text-text-muted text-sm">건강한 복약 관리의 시작</p>
      </div>
      <form className="bg-card text-text-base flex flex-col rounded-2xl p-5 gap-5">
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
          className="bg-button h-14 rounded-4xl w-full text-text-reverse-base cursor-pointer hover:bg-hover-color"
        >
          로그인
        </button>
      </form>
      <p className="text-text-muted mt-6 text-center text-sm flex items-center justify-center gap-1">
        아직 계정이 없으신가요?
        <Link href="/signup" className="text-text-hint font-bold">
          회원가입
        </Link>
      </p>
    </section>
  );
}
