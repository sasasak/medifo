import { Pill, Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

// 오늘 복용할 약 분리 컴포넌트
// TODO: 복용 완료 체크(intake_logs 연동)는 별도 작업으로 진행 예정
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

            return (
              <Link
                key={medicine.id}
                href={`/medicine/${medicine.medicine_id}`}
                className="border-border-light hover:bg-card-muted flex items-center justify-between rounded-xl border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-card-muted flex aspect-square w-9 items-center justify-center rounded-lg">
                    <Pill size={18} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{medicineName}</p>
                    <p className="text-text-muted text-xs">
                      {medicine.times?.join(', ')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
