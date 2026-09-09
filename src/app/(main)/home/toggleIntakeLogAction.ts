'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type ToggleIntakeLogState = { error: string };

interface ToggleIntakeLogParams {
  userMedicineId: string;
  scheduledDate: string;
  scheduledTime: string;
  nextStatus: 'taken' | 'pending';
}

export const toggleIntakeLogAction = async ({
  userMedicineId,
  scheduledDate,
  scheduledTime,
  nextStatus,
}: ToggleIntakeLogParams): Promise<ToggleIntakeLogState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: '로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.' };
  }

  const { error } = await supabase
    .from('intake_logs')
    .update({
      status: nextStatus,
      taken_at: nextStatus === 'taken' ? new Date().toISOString() : null,
    })
    .eq('user_id', user.id)
    .eq('user_medicine_id', userMedicineId)
    .eq('scheduled_date', scheduledDate)
    .eq('scheduled_time', scheduledTime);

  if (error) {
    return { error: '복용 상태 변경에 실패했습니다. 다시 시도해주세요.' };
  }

  revalidatePath('/home');
  return { error: '' };
};
