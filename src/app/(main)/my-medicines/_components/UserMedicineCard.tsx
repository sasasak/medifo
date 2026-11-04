'use client';

import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { createClient } from '@/utils/supabase/client';
import { CircleStop, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { stopUserMedicineAction } from '../stopUserMedicineAction';

interface UserMedicineCardProps {
  id: string;
  medicineId: string;
  name: string;
  frequency: string;
  times: string[];
  dosage?: string;
}

type ConfirmTarget = 'stop' | 'delete' | null;

export default function UserMedicineCard({
  id,
  medicineId,
  name,
  frequency,
  times,
  dosage,
}: UserMedicineCardProps) {
  const router = useRouter();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  // Toast의 effect 의존성에 들어가므로 렌더마다 새로 만들지 않음
  const handleToastClose = useCallback(() => setErrorMessage(''), []);

  const handleStop = () => {
    setErrorMessage('');
    startTransition(async () => {
      const result = await stopUserMedicineAction(id);
      setConfirmTarget(null);
      if (result.error) {
        setErrorMessage(result.error);
      }
    });
  };

  const handleDelete = () => {
    setErrorMessage('');
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_medicines')
        .delete()
        .eq('id', id);

      setConfirmTarget(null);
      if (error) {
        setErrorMessage('삭제에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <div className="bg-card border-border-light hover:bg-card-muted relative cursor-pointer rounded-2xl border p-4 transition-colors">
        {/* 카드 전체를 덮는 링크. 종료·삭제 버튼을 링크 안에 넣지 않으려고 겹쳐 둠 */}
        <Link
          href={`/medicine/${medicineId}`}
          aria-label={`${name} 상세 보기`}
          className="absolute inset-0 rounded-2xl"
        />
        <div className="flex items-center justify-between">
          <span className="font-bold">{name}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`${name} 복용 종료`}
              title="복용 종료"
              className="text-text-muted hover:text-accent-400 relative cursor-pointer"
              onClick={() => setConfirmTarget('stop')}
            >
              <CircleStop size={16} />
            </button>
            <button
              type="button"
              aria-label={`${name} 삭제`}
              title="삭제"
              className="text-text-muted hover:text-danger-400 relative cursor-pointer"
              onClick={() => setConfirmTarget('delete')}
            >
              <Trash2 size={16} />
            </button>
          </div>
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

      <Modal
        isOpen={confirmTarget === 'stop'}
        onClose={() => setConfirmTarget(null)}
        title="복용을 종료할까요?"
        description="오늘 남은 일정과 앞으로의 일정이 사라지고, 지난 복용 기록은 달력에 그대로 남습니다. 다시 복용하려면 약을 새로 등록해 주세요."
        confirmLabel={isPending ? '처리 중...' : '복용 종료'}
        cancelLabel="취소"
        onConfirm={handleStop}
        isConfirmDisabled={isPending}
      />
      <Modal
        isOpen={confirmTarget === 'delete'}
        onClose={() => setConfirmTarget(null)}
        title="약을 삭제할까요?"
        description="삭제하면 이 약의 지난 복용 기록도 모두 함께 삭제되며 복구할 수 없습니다. 기록을 남기려면 '복용 종료'를 이용해 주세요."
        confirmLabel={isPending ? '처리 중...' : '삭제하기'}
        cancelLabel="취소"
        onConfirm={handleDelete}
        isConfirmDisabled={isPending}
      />
      {errorMessage && (
        <Toast message={errorMessage} onClose={handleToastClose} />
      )}
    </>
  );
}
