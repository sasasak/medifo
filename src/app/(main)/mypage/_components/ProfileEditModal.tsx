'use client';

import Input from '@/components/ui/Input';
import { useActionState, useEffect } from 'react';
import { updateProfileAction } from '../updateProfileAction';

interface ProfileEditModalProps {
  onClose: () => void;
  currentNickname: string;
}

const initialState = { error: '', success: false };

export default function ProfileEditModal({
  onClose,
  currentNickname,
}: ProfileEditModalProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-card relative z-10 w-full max-w-sm rounded-2xl p-6">
        <h2 className="text-text-base text-lg font-bold">프로필 수정</h2>
        <form action={formAction} className="mt-4 flex flex-col gap-2">
          <Input
            id="nickname"
            type="text"
            label="닉네임"
            name="nickname"
            defaultValue={currentNickname}
            placeholder="사용할 닉네임을 입력해주세요."
          />
          {state.error && (
            <p className="text-danger-400 px-2 text-sm">{state.error}</p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-text-base bg-card-muted hover:bg-primary-400 flex-1 cursor-pointer rounded-xl py-3 text-sm transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-button text-text-reverse-base hover:bg-primary-100 flex-1 cursor-pointer rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
