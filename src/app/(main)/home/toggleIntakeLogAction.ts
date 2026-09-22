'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const EDITABLE_PAST_DAYS = 7;

type ToggleIntakeLogState = { error: string };

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffInDays(fromStr: string, toStr: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round(
    (parseDateString(fromStr).getTime() -
      parseDateString(toStr).getTime()) /
      MS_PER_DAY,
  );
}

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

  // 클라이언트의 disabled 처리는 우회될 수 있으므로 서버에서도 수정 가능 기간을 재검증
  const todayStr = toDateString(new Date());
  if (
    scheduledDate > todayStr ||
    diffInDays(todayStr, scheduledDate) > EDITABLE_PAST_DAYS
  ) {
    return { error: '수정 가능한 기간이 지났습니다.' };
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
