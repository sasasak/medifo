import type { SupabaseClient } from '@supabase/supabase-js';
import { addDays, getEditableFloor, toDateString } from './editableRange';

const SCHEDULE_DAYS = 90;

function maxDateStr(a: string, b: string): string {
  return a > b ? a : b;
}

interface RegenerateScheduleParams {
  userId: string;
  userMedicineId: string;
  times: string[];
  startDate: string;
  repeatType: 'daily' | 'once';
}

// 약 등록/시작일·시간·주기 수정 시 호출: 이 약의 pending 일정을 지우고 새로 생성한다.
// - 지우는 범위: 수정 가능 기간(오늘 - EDITABLE_PAST_DAYS 이후) 또는 새 시작일 이전의 pending
//   (수정할 수 없는 오래된 기록은 남기고, 시작일을 늦추면 그 이전 일정은 정리한다)
// - 이미 taken 처리된 기록은 건드리지 않는다
// - daily: 시작일이 과거면 오늘 기준 최근 EDITABLE_PAST_DAYS일 이내의 소급분까지만 채우고,
//   시작일(미래면 시작일, 아니면 오늘) 기준 향후 SCHEDULE_DAYS일치를 생성한다.
// - once: 시작일 하루만 생성한다. 시작일이 EDITABLE_PAST_DAYS보다 오래된 과거면 생성하지 않는다.
export async function regenerateSchedule(
  supabase: SupabaseClient,
  {
    userId,
    userMedicineId,
    times,
    startDate,
    repeatType,
  }: RegenerateScheduleParams,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error(`올바르지 않은 시작 날짜: ${startDate}`);
  }

  const todayStr = toDateString(new Date());
  const editableFloor = getEditableFloor(todayStr);

  const { error: deleteError } = await supabase
    .from('intake_logs')
    .delete()
    .eq('user_medicine_id', userMedicineId)
    .eq('status', 'pending')
    .or(`scheduled_date.gte.${editableFloor},scheduled_date.lt.${startDate}`);

  if (deleteError) throw deleteError;

  if (times.length === 0) return;

  let dates: string[] = [];

  if (repeatType === 'once') {
    if (startDate >= editableFloor) {
      dates = [startDate];
    }
  } else {
    const rangeStart = maxDateStr(startDate, editableFloor);
    const forwardAnchor = maxDateStr(startDate, todayStr);
    const forwardEnd = addDays(forwardAnchor, SCHEDULE_DAYS - 1);

    for (let d = rangeStart; d <= forwardEnd; d = addDays(d, 1)) {
      dates.push(d);
    }
  }

  if (dates.length === 0) return;

  const rows = dates.flatMap((scheduled_date) =>
    times.map((scheduled_time) => ({
      user_id: userId,
      user_medicine_id: userMedicineId,
      scheduled_date,
      scheduled_time,
      status: 'pending',
    })),
  );

  const { error: insertError } = await supabase
    .from('intake_logs')
    .upsert(rows, {
      onConflict: 'user_medicine_id,scheduled_date,scheduled_time',
      ignoreDuplicates: true,
    });

  if (insertError) throw insertError;
}
