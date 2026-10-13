'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton({ name }: { name: string }) {
  const router = useRouter();
  return (
    <div className="mb-4 flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-0.5 shrink-0 cursor-pointer"
      >
        <ArrowLeft size={24} />
      </button>
      {/* 수출명까지 붙은 긴 제품명이 여러 줄이 되지 않도록 한 줄로 자르고 전체 이름은 title로 */}
      <h1 className="min-w-0 truncate text-xl font-semibold" title={name}>
        {name}
      </h1>
    </div>
  );
}
