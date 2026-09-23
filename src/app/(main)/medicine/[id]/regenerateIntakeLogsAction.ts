'use server';

import { createClient } from '@/utils/supabase/server';
import { regenerateSchedule } from '@/utils/intakeLogs/regenerateSchedule';
import type { RepeatType } from '@/schemas/medicineRegisterSchema';

type RegenerateIntakeLogsState = { error: string };

export const regenerateIntakeLogsAction = async (
  userMedicineId: string,
  times: string[],
  startDate: string,
  repeatType: RepeatType,
): Promise<RegenerateIntakeLogsState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: '로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.' };
  }

  try {
    await regenerateSchedule(supabase, {
      userId: user.id,
      userMedicineId,
      times,
      startDate,
      repeatType,
    });
  } catch {
    return { error: '복용 일정 생성에 실패했습니다. 다시 시도해주세요.' };
  }

  return { error: '' };
};
