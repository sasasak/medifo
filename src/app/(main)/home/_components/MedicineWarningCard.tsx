import Link from 'next/link';

interface MedicineWarningCardProps {
  id: string;
  name: string;
  description: string;
}

export default function MedicineWarningCard({
  id,
  name,
  description,
}: MedicineWarningCardProps) {
  return (
    <Link
      href={`/medicine/${id}`}
      className="hover:border-border-focus bg-card border-border-light flex h-36 cursor-pointer flex-col justify-between gap-2 rounded-2xl border p-4 transition-colors"
    >
      <div>
        <h3 className="font-bold">{name}</h3>
        <p className="text-text-base text-sm">{description}</p>
      </div>
      <span className="text-text-muted mt-2 text-sm">상세보기 &gt;</span>
    </Link>
  );
}
