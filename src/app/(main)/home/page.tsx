import { createClient } from '@/utils/supabase/server';
import HomeHeader from './_components/HomeHeader';
import TodayMedicines from './_components/TodayMedicines';
import MedicineCalendar from './_components/MedicineCalendar';
import MedicineWarnings from './_components/MedicineWarning';

interface HomeProps {
  searchParams: Promise<{ month?: string }>;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('users')
    .select('nickname')
    .eq('id', user?.id)
    .single();

  const date = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const { month: monthParam } = await searchParams;
  const now = new Date();
  const [year, month] = monthParam
    ? monthParam.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const monthStart = toDateString(new Date(year, month - 1, 1));
  const monthEnd = toDateString(new Date(year, month, 0));
  const todayStr = toDateString(now);

  const { data: logs } = await supabase
    .from('intake_logs')
    .select('scheduled_date, status')
    .eq('user_id', user?.id ?? '')
    .gte('scheduled_date', monthStart)
    .lte('scheduled_date', monthEnd);

  const statusesByDate = new Map<string, string[]>();
  (logs ?? []).forEach((log) => {
    const list = statusesByDate.get(log.scheduled_date) ?? [];
    list.push(log.status);
    statusesByDate.set(log.scheduled_date, list);
  });

  const statusByDate: Record<string, 'green' | 'red'> = {};
  statusesByDate.forEach((statuses, dateStr) => {
    if (dateStr >= todayStr) return; // 오늘/미래는 표시하지 않음 (진행 중)
    const allTaken = statuses.every((status) => status === 'taken');
    statusByDate[dateStr] = allTaken ? 'green' : 'red';
  });

  return (
    <section className="mx-6">
      <HomeHeader nickname={data?.nickname} date={date} />

      <div className="border-border-light mt-6 flex gap-6 border-t pt-6">
        <TodayMedicines />
        <MedicineCalendar
          year={year}
          month={month}
          statusByDate={statusByDate}
        />
      </div>
      <MedicineWarnings />
    </section>
  );
}
