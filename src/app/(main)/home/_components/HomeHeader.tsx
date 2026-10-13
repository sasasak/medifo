'use client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Bell } from 'lucide-react';

interface HomeHeaderProps {
  nickname?: string;
  date: string;
}

export default function HomeHeader({ nickname, date }: HomeHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <p className="text-xl">안녕하세요, {nickname}님 🖐️</p>
        <time className="text-xs">{date}</time>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button type="button" className="cursor-pointer">
          <Bell size={20} />
        </button>
      </div>
    </div>
  );
}
