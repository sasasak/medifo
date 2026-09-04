import { createClient } from '@/utils/supabase/server';
import ProfileCard from './_components/ProfileCard';
import SettingsSection from './_components/SettingsSection';
import WithdrawButton from './_components/WithdrawButton';

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('users')
    .select('nickname')
    .eq('id', user?.id)
    .single();

  return (
    <section className="mx-6 flex flex-col gap-6">
      <h1 className="text-text-base text-xl">마이페이지</h1>

      <ProfileCard nickname={data?.nickname ?? ''} email={user?.email ?? ''} />

      <div className="flex flex-col gap-2">
        <p className="text-text-muted px-1 text-sm">설정</p>
        <SettingsSection />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-text-muted px-1 text-sm">계정</p>
        <div className="bg-card border-card-border rounded-2xl border">
          <WithdrawButton />
        </div>
      </div>
    </section>
  );
}
