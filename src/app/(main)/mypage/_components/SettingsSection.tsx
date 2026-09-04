'use client';

import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Bell, Moon } from 'lucide-react';
import { useHasMounted } from '@/hooks/useHasMounted';

function Switch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-primary-400' : 'bg-card-muted'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsSection() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();
  // TODO: 알림 설정은 아직 백엔드에 저장할 필드가 없어 로컬 상태로만 동작함.
  // 실제로 알림 on/off를 서버에 반영하려면 users 테이블에 컬럼 추가 필요.
  const [notification, setNotification] = useState(true);

  return (
    <div className="bg-card border-card-border divide-border-light divide-y rounded-2xl border">
      <div className="flex items-center justify-between p-5">
        <div className="text-text-base flex items-center gap-3 text-sm">
          <Moon size={18} />
          다크 모드
        </div>
        <Switch
          checked={mounted && theme === 'dark'}
          onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          ariaLabel="다크모드 전환"
        />
      </div>
      <div className="flex items-center justify-between p-5">
        <div className="text-text-base flex items-center gap-3 text-sm">
          <Bell size={18} />
          알림 설정
        </div>
        <Switch
          checked={notification}
          onChange={() => setNotification((prev) => !prev)}
          ariaLabel="알림 설정 전환"
        />
      </div>
    </div>
  );
}
