'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MedicineCalendarProps {
  year: number;
  month: number; // 1-12
  statusByDate: Record<string, 'green' | 'red'>;
  selectedDate?: string;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MedicineCalendar({
  year,
  month,
  statusByDate,
  selectedDate,
}: MedicineCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const todayStr = toDateString(today);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  const goToMonth = (y: number, m: number) => {
    const normalized = new Date(y, m - 1, 1);
    const query = `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, '0')}`;
    router.push(`/home?month=${query}`);
  };

  const prevMonth = () => goToMonth(year, month - 1);
  const nextMonth = () => goToMonth(year, month + 1);

  const goToDate = (dateStr: string) => {
    const query = `${year}-${String(month).padStart(2, '0')}`;
    router.push(`/home?month=${query}&date=${dateStr}`);
  };

  return (
    <div className="bg-card border-border-light min-h-100 flex-1 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">이번 달 복용 현황</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm">
          {year}년 {month}월
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
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          const isPast = dateStr < todayStr;
          const isSelected = dateStr === selectedDate;
          const status = statusByDate[dateStr];

          return (
            <div key={day} className="my-1 flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isPast}
                onClick={() => goToDate(dateStr)}
                className={`mx-auto flex aspect-square w-8 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? 'bg-accent-400 text-white'
                    : isFuture
                      ? 'text-text-muted cursor-not-allowed opacity-50'
                      : `cursor-pointer hover:bg-card-muted ${isSelected ? 'ring-accent-400 ring-2' : ''}`
                }`}
              >
                {day}
              </button>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'green'
                    ? 'bg-primary-400'
                    : status === 'red'
                      ? 'bg-danger-400'
                      : ''
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
