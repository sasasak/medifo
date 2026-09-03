'use client';

import { useState } from 'react';
import ProfileEditModal from './ProfileEditModal';

interface ProfileCardProps {
  nickname: string;
  email: string;
}

export default function ProfileCard({ nickname, email }: ProfileCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const initial = nickname?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-card border-card-border flex items-center justify-between rounded-2xl border p-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary-400 text-text-reverse-base flex h-11 w-11 items-center justify-center rounded-full text-base font-medium">
          {initial}
        </div>
        <div>
          <p className="text-text-base text-base font-medium">{nickname}</p>
          <p className="text-text-muted text-sm">{email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsEditOpen(true)}
        className="border-card-border text-text-base cursor-pointer rounded-xl border px-3 py-2 text-sm"
      >
        프로필 수정
      </button>

      {isEditOpen && (
        <ProfileEditModal
          onClose={() => setIsEditOpen(false)}
          currentNickname={nickname}
        />
      )}
    </div>
  );
}
