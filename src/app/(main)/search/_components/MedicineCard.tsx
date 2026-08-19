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
          href={`/medicine/${id}`}
          className="bg-button text-text-reverse-base hover:bg-hover-color flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors"
        >
          등록
        </Link>
      </div>
    </div>
  );
}
