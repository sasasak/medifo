'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MedicineCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="bg-card border-border-light min-h-100 flex-1 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">이번 달 복용 현황</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm">
          {year}년 {month + 1}월
        </span>
        <div className="flex gap-2">
          <button onClick={prevMonth} type="button" className="cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} type="button" className="cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-xs">
        {days.map((day) => (
          <div key={day} className="text-text-muted py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={i} />
        ))}
        {Array.from({ length: lastDate }).map((_, i) => {
          const day = i + 1;
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <div
              key={day}
              className={`mx-auto my-1 flex aspect-square w-8 items-center justify-center rounded-full text-xs ${isToday ? 'bg-accent-400 text-white' : 'hover:bg-card-muted'}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
