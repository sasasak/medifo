import { Pill } from 'lucide-react';

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
      {/* TODO: 추후 복용 약 등록 기능 연결  */}
      <button
        type="button"
        className="border-border-focus hover:bg-card-muted shrink-0 cursor-pointer rounded-full border px-4 py-2"
      >
        등록
      </button>
    </div>
  );
}
