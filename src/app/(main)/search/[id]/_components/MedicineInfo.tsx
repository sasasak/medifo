import { Pill } from 'lucide-react';

interface MedicineInfoProps {
  name: string;
  manufacturer: string;
  efficacy: string;
}

export default function MedicineInfo({
  name,
  manufacturer,
  efficacy,
}: MedicineInfoProps) {
  return (
    <div className="bg-card border-border-light flex items-center gap-6 rounded-2xl border p-10">
      <div className="bg-card-muted flex h-40 w-40 shrink-0 items-center justify-center rounded-xl">
        {/* TODO: 추후 알약 이미지 들어감 */}
        <Pill size={75} className="text-text-muted" />
      </div>
      <div className="flex h-40 flex-col justify-around py-2">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{name}</span>
          <span className="text-text-muted font-semibold">{manufacturer}</span>
        </div>
        {/* TODO: 추후 알약 용량 데이터 테이블, 렌더링 추가 */}
        <div className="flex flex-wrap gap-2">
          {efficacy.split(',').map((tag) => (
            <span
              key={tag}
              className="bg-card-muted text-text-muted rounded-full px-4 py-1 font-semibold"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
