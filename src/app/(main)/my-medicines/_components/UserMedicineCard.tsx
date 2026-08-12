import { Trash2 } from 'lucide-react';

interface UserMedicineCardProps {
  id: string;
  name: string;
  dosage?: string;
  frequency: string;
  times: string[];
}

export default function UserMedicineCard({
  id,
  name,
  dosage,
  frequency,
  times,
}: UserMedicineCardProps) {
  return (
    <div className="bg-card border-border-light rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <span className="font-bold">{name}</span>
        <button
          type="button"
          className="text-text-muted hover:text-danger-400 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="text-text-muted mt-2 flex items-center gap-2 text-sm">
        {dosage && (
          <>
            <span>{dosage}</span>
            <span>|</span>
          </>
        )}
        <span>{frequency}</span>
        <span>|</span>
        <span>{times?.join(', ')}</span>
      </div>
    </div>
  );
}
