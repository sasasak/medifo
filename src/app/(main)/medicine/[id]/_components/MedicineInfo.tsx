import MedicineImage from '@/components/ui/MedicineImage';

interface MedicineInfoProps {
  name: string;
  manufacturer: string | null;
  efficacy: string | null;
  imageUrl: string | null;
}

export default function MedicineInfo({
  name,
  manufacturer,
  efficacy,
  imageUrl,
}: MedicineInfoProps) {
  return (
    <div className="bg-card border-border-light flex items-center gap-6 rounded-2xl border p-10">
      <div className="bg-card-muted relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        <MedicineImage src={imageUrl} alt={name} iconSize={75} sizes="160px" />
      </div>
      <div className="flex min-w-0 flex-col gap-4 py-2">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold break-keep">{name}</span>
          <span className="text-text-muted font-semibold">{manufacturer}</span>
        </div>
        {/* TODO: 추후 알약 용량 데이터 테이블, 렌더링 추가 */}
        {/* 효능은 "이 약은 …에 사용합니다." 문장이라 태그로 쪼개지 않고 요약만 노출, 전문은 아코디언에서 */}
        {efficacy && (
          <p className="text-text-muted line-clamp-2 font-semibold">
            {efficacy}
          </p>
        )}
      </div>
    </div>
  );
}
