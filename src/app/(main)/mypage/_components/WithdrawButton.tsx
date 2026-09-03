'use client';

import Modal from '@/components/ui/Modal';
import { useState, useTransition } from 'react';
import { withdrawAction } from '../withdrawAction';

export default function WithdrawButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleConfirm = () => {
    setError('');
    startTransition(async () => {
      const result = await withdrawAction();
      // redirect가 성공하면 이 아래 코드는 실행되지 않음
      if (result?.error) {
        setError(result.error);
        setIsModalOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="text-danger-400 flex w-full cursor-pointer items-center justify-between px-5 py-4 text-sm"
      >
        회원 탈퇴
      </button>

      {error && <p className="text-danger-400 px-5 py-2 text-xs">{error}</p>}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="정말 탈퇴하시겠어요?"
        description="탈퇴 시 등록된 복용 정보와 검색 기록이 모두 삭제되며 복구할 수 없습니다."
        confirmLabel={isPending ? '처리 중...' : '탈퇴하기'}
        cancelLabel="취소"
        onConfirm={handleConfirm}
      />
    </>
  );
}
