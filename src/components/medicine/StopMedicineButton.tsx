'use client';

import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { stopUserMedicineAction } from '@/app/(main)/my-medicines/stopUserMedicineAction';
import { useCallback, useState, useTransition, type ReactNode } from 'react';

interface StopMedicineButtonProps {
  userMedicineId: string;
  className: string;
  ariaLabel?: string;
  onStopped?: () => void;
  children: ReactNode;
}

// 복용 종료 버튼 + 종료 확인 창 + 실패 토스트 (내 복용 약 카드, 약 상세에서 함께 사용)
export default function StopMedicineButton({
  userMedicineId,
  className,
  ariaLabel,
  onStopped,
  children,
}: StopMedicineButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  // Toast의 effect 의존성에 들어가므로 렌더마다 새로 만들지 않음
  const handleToastClose = useCallback(() => setErrorMessage(''), []);

  const handleStop = () => {
    setErrorMessage('');
    startTransition(async () => {
      const result = await stopUserMedicineAction(userMedicineId);
      setIsOpen(false);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      onStopped?.();
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="복용을 종료할까요?"
        description="오늘 남은 일정과 앞으로의 일정이 사라지고, 지난 복용 기록은 달력에 그대로 남습니다. 다시 복용하려면 약을 새로 등록해 주세요."
        confirmLabel={isPending ? '처리 중...' : '복용 종료'}
        cancelLabel="취소"
        onConfirm={handleStop}
        isConfirmDisabled={isPending}
      />
      {errorMessage && (
        <Toast message={errorMessage} onClose={handleToastClose} />
      )}
    </>
  );
}
