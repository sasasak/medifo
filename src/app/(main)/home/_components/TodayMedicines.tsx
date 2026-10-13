import { Pill, Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import TodayMedicineItem from './TodayMedicineItem';

const EDITABLE_PAST_DAYS = 7;

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffInDays(fromStr: string, toStr: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round(
    (parseDateString(fromStr).getTime() - parseDateString(toStr).getTime()) /
      MS_PER_DAY,
  );
}

interface TodayMedicinesProps {
  selectedDate?: string;
}

interface MedicineRow {
  userMedicineId: string;
  medicineId: string;
  name: string;
  times: string[];
  takenTimes: string[];
}

// 오늘 복용할 약 / 과거 날짜 복용 기록 카드
export default async function TodayMedicines({
  selectedDate,
}: TodayMedicinesProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStr = toDateString(new Date());
  const targetDate = selectedDate ?? todayStr;
  const isPastView = !!selectedDate;

  // 과거 날짜를 수정 가능한 기간(오늘 기준 D-1 ~ D-7)인지 계산
  const editable =
    !isPastView || diffInDays(todayStr, targetDate) <= EDITABLE_PAST_DAYS;

  const { data: logs } = await supabase
    .from('intake_logs')
    .select(
      `
      user_medicine_id,
      scheduled_time,
      status,
      user_medicines (
        id,
        medicine_id,
        medicines ( name )
      )
    `,
    )
    .eq('user_id', user?.id ?? '')
    .eq('scheduled_date', targetDate)
    .order('scheduled_time', { ascending: true });

  const groups = new Map<string, MedicineRow>();
  (logs ?? []).forEach((log) => {
    const userMedicine = log.user_medicines as unknown as {
      id: string;
      medicine_id: string;
      medicines: { name: string } | null;
    } | null;
    if (!userMedicine) return;

    const existing: MedicineRow = groups.get(log.user_medicine_id) ?? {
      userMedicineId: log.user_medicine_id,
      medicineId: userMedicine.medicine_id,
      name: userMedicine.medicines?.name ?? '',
      times: [],
      takenTimes: [],
    };
    existing.times.push(log.scheduled_time);
    if (log.status === 'taken') existing.takenTimes.push(log.scheduled_time);
    groups.set(log.user_medicine_id, existing);
  });

  const rows = Array.from(groups.values());

  return (
    <div className="bg-card border-border-light min-h-100 flex-1 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {isPastView ? `${targetDate} 복용한 약` : '오늘 복용할 약'}
          </h2>
          {isPastView && (
            <Link
              href="/home"
              className="text-text-muted hover:text-accent-400 text-xs underline"
            >
              오늘로 돌아가기
            </Link>
          )}
        </div>
        <Link
          href="/search"
          className="hover:bg-card-muted border-border-light text-text-muted flex cursor-pointer items-center gap-1 rounded-4xl border p-3 text-sm transition-colors"
        >
          <Plus size={20} /> 약 추가하기
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 pt-10">
          <div className="bg-card-muted flex aspect-square w-15 items-center justify-center rounded-full">
            <Pill size={30} className="text-text-muted" />
          </div>
          <p className="text-sm">
            {isPastView
              ? '이 날짜에는 복용 기록이 없어요'
              : '오늘 예정된 복약이 없어요'}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {rows.map((row) => (
            <TodayMedicineItem
              key={`${targetDate}-${row.userMedicineId}`}
              userMedicineId={row.userMedicineId}
              medicineId={row.medicineId}
              name={row.name}
              times={row.times}
              scheduledDate={targetDate}
              takenTimes={row.takenTimes}
              editable={editable}
            />
          ))}
        </div>
      )}
    </div>
  );
}
