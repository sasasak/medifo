'use client';

import { logoutAction } from '@/app/(auth)/logout/logoutAction';
import { Home, LogOut, MapPin, Pill, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Modal from '../ui/Modal';
import { useState } from 'react';

const MENUS = {
  USER: [
    { name: '홈', href: '/home', icon: Home },
    { name: '약 검색', href: '/search', icon: Search },
    { name: '복용 관리', href: '/my-medicines', icon: Pill },
    { name: '주변 약국', href: '/pharmacy', icon: MapPin },
    { name: '마이페이지', href: '/mypage', icon: User },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isModalOpen, SetIsModalOpen] = useState(false);
  return (
    <aside className="bg-card hidden min-h-screen w-full max-w-60 flex-col justify-between md:flex">
      <div>
        <div className="mx-6 my-6 flex items-center gap-3">
          <div className="bg-sidebar-active flex h-12 w-12 items-center justify-center rounded-xl">
            <Pill size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-light">Medifo</span>
            <p className="text-sidebar-text text-sm">건강한 복약 관리의 시작</p>
          </div>
        </div>
        <nav aria-labelledby="sidemenu-title">
          <h2 id="sidemenu-title" className="sr-only">
            사이드바 메뉴
          </h2>
          <ul className="border-sidebar-active mt-3 flex flex-col border-t p-4">
            {MENUS.USER.map((menu) => {
              const isActive = pathname.startsWith(menu.href);
              const Icon = menu.icon;
              return (
                <li
                  key={menu.name}
                  className={`text-sidebar-text relative mb-2 flex h-14.25 cursor-pointer items-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-sidebar-active font-bold text-white'
                      : 'hover:bg-card-muted hover:text-white'
                  }`}
                >
                  <Link
                    href={menu.href}
                    className="flex h-full w-full items-center gap-3 px-5 text-sm"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} />
                    {menu.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="border-sidebar-active border-t p-4">
        <Modal
          isOpen={isModalOpen}
          onClose={() => SetIsModalOpen(false)}
          title="로그아웃"
          description="로그아웃 하시겠습니까?"
          confirmLabel="로그아웃"
          cancelLabel="취소"
          onConfirm={() => logoutAction()}
        />
        <button
          type="button"
          onClick={() => SetIsModalOpen(true)}
          className="text-sidebar-text hover:bg-card-muted flex w-full cursor-pointer items-center gap-3 rounded-xl px-5 py-4 text-sm transition-colors"
        >
          <LogOut size={20} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
