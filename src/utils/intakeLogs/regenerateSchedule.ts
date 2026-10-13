import type { SupabaseClient } from '@supabase/supabase-js';

const SCHEDULE_DAYS = 90;
// toggleIntakeLogAction / TodayMedicines의 EDITABLE_PAST_DAYS와 동일한 기준
// (그보다 오래된 과거는 복용 여부를 수정할 수 없으므로 소급 생성해도 의미가 없다)
const EDITABLE_PAST_DAYS = 7;

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

function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

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

// 약 등록/시작일·시간·주기 수정 시 호출: 이 약의 pending 일정을 전부 지우고 새로 생성한다.
// (이미 taken 처리된 기록은 건드리지 않는다)
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
  const todayStr = toDateString(new Date());
  const editableFloor = addDays(todayStr, -EDITABLE_PAST_DAYS);

  const { error: deleteError } = await supabase
    .from('intake_logs')
    .delete()
    .eq('user_medicine_id', userMedicineId)
    .eq('status', 'pending');

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
