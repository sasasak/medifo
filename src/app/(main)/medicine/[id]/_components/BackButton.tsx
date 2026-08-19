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
        className="mb-0.5 cursor-pointer"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-xl font-semibold">{name}</h1>
    </div>
  );
}
