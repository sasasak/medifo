import { createClient } from '@/utils/supabase/server';
import HomeHeader from './_components/HomeHeader';
import TodayMedicines from './_components/TodayMedicines';
import MedicineCalendar from './_components/MedicineCalendar';

export default async function Home() {
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

  return (
    <section>
      <HomeHeader nickname={data?.nickname} date={date} />

      <div className="mt-6 flex gap-6">
        <TodayMedicines />
        <MedicineCalendar />
      </div>
      {/* 추후에 
      <MedicineWarnings />
      조립 
      */}
    </section>
  );
}
