'use client';

import { createClient } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
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
    <div className="bg-card border-border-light hover:bg-card-muted relative cursor-pointer rounded-2xl border p-4 transition-colors">
      {/* 카드 전체를 덮는 링크. 삭제 버튼을 링크 안에 넣지 않으려고 겹쳐 둠 */}
      <Link
        href={`/medicine/${medicineId}`}
        aria-label={`${name} 상세 보기`}
        className="absolute inset-0 rounded-2xl"
      />
      <div className="flex items-center justify-between">
        <span className="font-bold">{name}</span>
        <button
          type="button"
          aria-label={`${name} 삭제`}
          className="text-text-muted hover:text-danger-400 relative cursor-pointer"
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
