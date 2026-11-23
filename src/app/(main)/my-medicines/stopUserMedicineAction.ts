'use server';

import { createClient } from '@/utils/supabase/server';
import { toDateString } from '@/utils/intakeLogs/editableRange';
import { revalidatePath } from 'next/cache';

type StopUserMedicineState = { error: string };

const STOP_FAILED_MESSAGE = '복용 종료에 실패했습니다. 다시 시도해주세요.';

// 복용 종료: 오늘 포함 앞으로의 pending 일정을 지우고 is_active를 false로 바꾼다.
// - 이미 체크한 taken 기록과 지난 날짜의 기록은 그대로 둔다
// - pending 삭제를 먼저 하므로 마지막 단계가 실패해도 목록에 남아 다시 시도할 수 있다
// - RLS에 막히면 오류 없이 0행이 처리되므로 단계마다 처리 결과를 확인한다
export const stopUserMedicineAction = async (
  userMedicineId: string,
): Promise<StopUserMedicineState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: '로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.' };
  }

  // 1. 소유자 확인
  const { data: owned, error: ownedError } = await supabase
    .from('user_medicines')
    .select('id')
    .eq('id', userMedicineId)
    .eq('user_id', user.id);

  if (ownedError || !owned || owned.length === 0) {
    return { error: STOP_FAILED_MESSAGE };
  }

  // 2. 오늘 포함 앞으로의 pending 삭제
  // 지울 pending이 원래 없을 수 있어(1회성 지난 약, 오늘 모두 체크 등) 삭제 행 수 대신 남은 행 수로 확인한다
  const todayStr = toDateString(new Date());
  const { error: deleteError } = await supabase
    .from('intake_logs')
    .delete()
    .eq('user_id', user.id)
    .eq('user_medicine_id', userMedicineId)
    .eq('status', 'pending')
    .gte('scheduled_date', todayStr);

  if (deleteError) {
    return { error: STOP_FAILED_MESSAGE };
  }

  const { data: remaining, error: remainingError } = await supabase
    .from('intake_logs')
    .select('scheduled_date')
    .eq('user_id', user.id)
    .eq('user_medicine_id', userMedicineId)
    .eq('status', 'pending')
    .gte('scheduled_date', todayStr)
    .limit(1);

  if (remainingError || (remaining && remaining.length > 0)) {
    return { error: STOP_FAILED_MESSAGE };
  }

  // 3. 복용 종료 표시
  const { data: updated, error: updateError } = await supabase
    .from('user_medicines')
    .update({ is_active: false })
    .eq('id', userMedicineId)
    .eq('user_id', user.id)
    .select('id');

  if (updateError || !updated || updated.length === 0) {
    return { error: STOP_FAILED_MESSAGE };
  }

  revalidatePath('/my-medicines');
  revalidatePath('/home');
  return { error: '' };
};
