'use server';

import { createClient } from '@/utils/supabase/server';
import { regenerateSchedule } from '@/utils/intakeLogs/regenerateSchedule';

type RegenerateIntakeLogsState = { error: string };

export const regenerateIntakeLogsAction = async (
  userMedicineId: string,
  times: string[],
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
    });
  } catch {
    return { error: '복용 일정 생성에 실패했습니다. 다시 시도해주세요.' };
  }

  return { error: '' };
};
