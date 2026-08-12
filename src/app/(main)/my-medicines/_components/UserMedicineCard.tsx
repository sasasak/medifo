'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';

interface UserMedicineCardProps {
  id: string;
  medicineId: string;
  name: string;
  frequency: string;
  times: string[];
  dosage?: string;
}

export default function UserMedicineCard({
  id,
  medicineId,
  name,
  frequency,
  times,
  dosage,
}: UserMedicineCardProps) {
  return (
    <Link href={`/medicine/${medicineId}`}>
      <div className="bg-card border-border-light hover:bg-card-muted cursor-pointer rounded-2xl border p-4 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-bold">{name}</span>
          {/* TODO: 추후 삭제 기능 연결 */}
          <button
            type="button"
            className="text-text-muted cursor-pointer"
            onClick={(e) => e.stopPropagation()}
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
    </Link>
  );
}
