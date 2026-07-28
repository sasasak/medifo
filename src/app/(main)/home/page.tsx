import { createClient } from '@/utils/supabase/server';
import HomeHeader from './_components/HomeHeader';
import TodayMedicines from './_components/TodayMedicines';
import MedicineCalendar from './_components/MedicineCalendar';
import MedicineWarnings from './_components/MedicineWarning';

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
    <section className="mx-6">
      <HomeHeader nickname={data?.nickname} date={date} />

      <div className="border-border-light mt-6 flex gap-6 border-t pt-6">
        <TodayMedicines />
        <MedicineCalendar />
      </div>
      <MedicineWarnings />
    </section>
  );
}
