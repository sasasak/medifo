import { Pill } from 'lucide-react';
import Link from 'next/link';

interface MedicineCardProps {
  id: string;
  name: string;
  manufacturer: string;
  efficacy: string;
}

export default function MedicineCard({
  id,
  name,
  manufacturer,
  efficacy,
}: MedicineCardProps) {
  return (
    <div className="bg-card border-border-light flex items-center gap-4 rounded-2xl border p-4">
      <div className="bg-card-muted flex aspect-square h-20 shrink-0 items-center justify-center rounded-xl">
        <Pill size={38} className="text-text-muted" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-lg font-bold">{name}</span>
        <span className="text-text-muted">{manufacturer}</span>
        <span className="text-text-hint text-sm">{efficacy}</span>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/search/${id}`}
          className="border-border-light text-card bg-hover-color hover:bg-card-muted hover:text-text-base flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
        >
          상세보기
        </Link>
        {/* TODO: 추후 복용 약 등록 기능 연결  */}
        <button
          type="button"
          className="border-border-light hover:bg-card-muted shrink-0 cursor-pointer rounded-full border px-4 py-2 font-semibold transition-colors"
        >
          등록
        </button>
      </div>
    </div>
  );
}
