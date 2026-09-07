import { Pill, Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import TodayMedicineItem from './TodayMedicineItem';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 오늘 복용할 약 분리 컴포넌트
export default async function TodayMedicines() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medicines } = await supabase
    .from('user_medicines')
    .select(
      `
      id,
      medicine_id,
      times,
      medicines (
        name
      )
    `,
    )
    .eq('user_id', user?.id ?? '')
    .eq('is_active', true);

  const todayStr = toDateString(new Date());
  const userMedicineIds = medicines?.map((medicine) => medicine.id) ?? [];

  const { data: logs } =
    userMedicineIds.length > 0
      ? await supabase
          .from('intake_logs')
          .select('user_medicine_id, scheduled_time, status')
          .eq('scheduled_date', todayStr)
          .in('user_medicine_id', userMedicineIds)
      : { data: [] };

  const takenSet = new Set(
    (logs ?? [])
      .filter((log) => log.status === 'taken')
      .map((log) => `${log.user_medicine_id}_${log.scheduled_time}`),
  );

  return (
    <div className="bg-card border-border-light min-h-100 flex-1 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">오늘 복용할 약</h2>
        <Link
          href="/search"
          className="hover:bg-card-muted border-border-light text-text-muted flex cursor-pointer items-center gap-1 rounded-4xl border p-3 text-sm transition-colors"
        >
          <Plus size={20} /> 약 추가하기
        </Link>
      </div>

      {!medicines || medicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 pt-10">
          <div className="bg-card-muted flex aspect-square w-15 items-center justify-center rounded-full">
            <Pill size={30} className="text-text-muted" />
          </div>
          <p className="text-sm">오늘 예정된 복약이 없어요</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {medicines.map((medicine) => {
            const medicineName =
              (medicine.medicines as unknown as { name: string } | null)
                ?.name ?? '';
            const times: string[] = medicine.times ?? [];
            const takenTimes = times.filter((time: string) =>
              takenSet.has(`${medicine.id}_${time}`),
            );

            return (
              <TodayMedicineItem
                key={medicine.id}
                userMedicineId={medicine.id}
                medicineId={medicine.medicine_id}
                name={medicineName}
                times={times}
                scheduledDate={todayStr}
                takenTimes={takenTimes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
