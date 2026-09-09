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

function toHHMM(time: string): string {
  return time.slice(0, 5);
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
    .select('scheduled_date, scheduled_time, status')
    .eq('user_id', user?.id ?? '')
    .gte('scheduled_date', monthStart)
    .lte('scheduled_date', monthEnd);

  const statusesByDate = new Map<string, string[]>();
  (logs ?? []).forEach((log) => {
    if (log.scheduled_date === todayStr) return; // 오늘은 예정 시각 경과 여부까지 봐야 해서 별도 처리
    const list = statusesByDate.get(log.scheduled_date) ?? [];
    list.push(log.status);
    statusesByDate.set(log.scheduled_date, list);
  });

  const statusByDate: Record<string, 'green' | 'red'> = {};
  statusesByDate.forEach((statuses, dateStr) => {
    if (dateStr > todayStr) return; // 미래는 표시하지 않음 (진행 중)
    const allTaken = statuses.every((status) => status === 'taken');
    statusByDate[dateStr] = allTaken ? 'green' : 'red';
  });

  // 오늘: 렌더링 시점 기준으로 예정 시각이 지난 항목만 "지났음"으로 간주
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dueTodayLogs = (logs ?? []).filter(
    (log) =>
      log.scheduled_date === todayStr && toHHMM(log.scheduled_time) <= nowHHMM,
  );
  if (dueTodayLogs.length > 0) {
    const allTaken = dueTodayLogs.every((log) => log.status === 'taken');
    statusByDate[todayStr] = allTaken ? 'green' : 'red';
  }

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
