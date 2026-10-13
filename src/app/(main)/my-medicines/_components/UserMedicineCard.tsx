'use client';

import { createClient } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const supabase = createClient();
    const { error } = await supabase
      .from('user_medicines')
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제 실패');
      return;
    }
    router.refresh();
  };

  return (
    <div
      className="bg-card border-border-light hover:bg-card-muted cursor-pointer rounded-2xl border p-4 transition-colors"
      onClick={() => router.push(`/medicine/${medicineId}`)}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold">{name}</span>
        <button
          type="button"
          className="text-text-muted hover:text-danger-400 cursor-pointer"
          onClick={handleDelete}
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
