'use client';

import StopMedicineButton from '@/components/medicine/StopMedicineButton';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  // Toast의 effect 의존성에 들어가므로 렌더마다 새로 만들지 않음
  const handleToastClose = useCallback(() => setErrorMessage(''), []);

  const handleDelete = () => {
    setErrorMessage('');
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_medicines')
        .delete()
        .eq('id', id);

      setIsDeleteOpen(false);
      if (error) {
        setErrorMessage('삭제에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <div className="group bg-card border-border-light hover:bg-card-muted relative cursor-pointer rounded-2xl border p-4 transition-colors">
        {/* 카드 전체를 덮는 링크. 종료·삭제 버튼을 링크 안에 넣지 않으려고 겹쳐 둠 */}
        <Link
          href={`/medicine/${medicineId}`}
          aria-label={`${name} 상세 보기`}
          className="absolute inset-0 rounded-2xl"
        />
        <span className="font-bold">{name}</span>
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
        {/* 제목이 카드 폭을 다 쓰도록 버튼은 아래 줄에 둠. 링크 위에 올리려고 relative 사용 */}
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <StopMedicineButton
            userMedicineId={id}
            ariaLabel={`${name} 복용 종료`}
            className="border-border-light text-text-base hover:border-button relative min-h-8 cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors"
          >
            복용 종료
          </StopMedicineButton>
          <button
            type="button"
            aria-label={`${name} 삭제`}
            className="text-danger-text group-hover:text-danger-text-hover relative min-h-8 cursor-pointer px-2 py-1.5 text-sm hover:underline"
            onClick={() => setIsDeleteOpen(true)}
          >
            삭제
          </button>
        </div>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
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
