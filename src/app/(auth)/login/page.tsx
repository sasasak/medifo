'use client';
import Input from "@/components/ui/Input";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ThemeToggle(){
   const { theme, setTheme } = useTheme();
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
    setMounted(true);
   }, []);

   if(!mounted) {
    return <button>테마 불러오는 중...</button>
   }

   return(
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="cursor-pointer">
        현재 : {theme}
    </button>
   
   )
}

export default function Login(){
    return(
        <section className="m-auto">
            <ThemeToggle />
            <h1 className="sr-only">로그인 페이지입니다.</h1>
            <h2 className="text-xl">Medifo</h2>
            <p>건강한 복약 관리의 시작</p>
            <form action="" className="bg-card text-text-base flex flex-col w-100 p-5 gap-8 rounded-2xl ">
                <Input id="email" type="email" label="이메일 " placeholder="email@email.com"/>
                <Input id="password" type="password" label="비밀번호" placeholder="비밀번호를 입력해주세요."/>
                <button type="button" className="bg-button rounded-4xl h-14">로그인</button>
            </form>
            <p>아직 계정이 없으신가요?
                <Link href="/signup">회원가입</Link>
            </p>
        </section>
    )
}