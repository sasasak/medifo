'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  isConfirmDisabled?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  isConfirmDisabled = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* 모달 */}
      <div className="bg-card relative z-10 w-full max-w-sm rounded-2xl p-6">
        <h2 className="text-text-base text-lg font-bold">{title}</h2>
        {description && (
          <p className="text-text-muted mt-2 text-sm">{description}</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-text-base bg-card-muted hover:bg-primary-400 flex-1 cursor-pointer rounded-xl py-3 text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="bg-button text-text-reverse-base hover:bg-primary-100 flex-1 cursor-pointer rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
