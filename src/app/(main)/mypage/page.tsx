import { createClient } from '@/utils/supabase/server';
import {
  DEMO_NOTICE_MESSAGE,
  DEMO_WITHDRAW_BLOCKED_MESSAGE,
  isDemoUser,
} from '@/utils/demoAccount';
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

  // 판별은 서버에서만 하고, 클라이언트 컴포넌트에는 결과만 넘김
  const isDemo = isDemoUser(user?.email);

  return (
    <section className="mx-6 flex flex-col gap-6">
      <h1 className="text-text-base text-xl">마이페이지</h1>

      {isDemo && (
        <p className="bg-card-muted text-text-base rounded-2xl px-5 py-4 text-sm break-keep">
          {DEMO_NOTICE_MESSAGE}
        </p>
      )}

      <ProfileCard
        nickname={data?.nickname ?? ''}
        email={user?.email ?? ''}
        canEdit={!isDemo}
      />

      <div className="flex flex-col gap-2">
        <p className="text-text-muted px-1 text-sm">설정</p>
        <SettingsSection />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-text-muted px-1 text-sm">계정</p>
        <div className="bg-card border-card-border rounded-2xl border">
          {isDemo ? (
            <p className="text-text-base px-5 py-4 text-sm break-keep">
              {DEMO_WITHDRAW_BLOCKED_MESSAGE}
            </p>
          ) : (
            <WithdrawButton />
          )}
        </div>
      </div>
    </section>
  );
}
