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

// 약 등록/시작일·시간·주기 수정 시 호출: 수정은 오늘부터 적용하고 지난 날짜의 기록은 건드리지 않는다.
// - 지우는 범위(pending만): 오늘 이후 + 시작일 범위 밖(daily는 시작일 이전, once는 시작일이 아닌 날짜)
// - 이미 taken 처리된 기록은 어떤 경우에도 건드리지 않는다
// - 오늘 이후: daily는 시작일(미래면 시작일, 아니면 오늘) 기준 향후 SCHEDULE_DAYS일치,
//   once는 시작일이 오늘 이후면 그 하루를 생성한다
// - 지난 날짜: 수정 가능 기간(오늘 - EDITABLE_PAST_DAYS) 안에서 이 약의 기록이 하나도 없는 날짜만 채운다
//   (시작일을 앞당겨 새로 포함된 날짜, 새로 등록한 약의 과거 시작일 등)
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

  const outOfRangeFilter =
    repeatType === 'once'
      ? `scheduled_date.neq.${startDate}`
      : `scheduled_date.lt.${startDate}`;

  const { error: deleteError } = await supabase
    .from('intake_logs')
    .delete()
    .eq('user_medicine_id', userMedicineId)
    .eq('status', 'pending')
    .or(`scheduled_date.gte.${todayStr},${outOfRangeFilter}`);

  if (deleteError) throw deleteError;

  if (times.length === 0) return;

  let pastDates: string[] = [];
  const futureDates: string[] = [];

  if (repeatType === 'once') {
    if (startDate >= todayStr) {
      futureDates.push(startDate);
    } else if (startDate >= editableFloor) {
      pastDates.push(startDate);
    }
  } else {
    const forwardAnchor = maxDateStr(startDate, todayStr);
    const forwardEnd = addDays(forwardAnchor, SCHEDULE_DAYS - 1);

    for (
      let d = maxDateStr(startDate, editableFloor);
      d < todayStr;
      d = addDays(d, 1)
    ) {
      pastDates.push(d);
    }
    for (let d = forwardAnchor; d <= forwardEnd; d = addDays(d, 1)) {
      futureDates.push(d);
    }
  }

  if (pastDates.length > 0) {
    const { data: existingLogs, error: selectError } = await supabase
      .from('intake_logs')
      .select('scheduled_date')
      .eq('user_medicine_id', userMedicineId)
      .gte('scheduled_date', pastDates[0])
      .lte('scheduled_date', pastDates[pastDates.length - 1]);

    if (selectError) throw selectError;

    const recordedDates = new Set(
      (existingLogs ?? []).map((log) => log.scheduled_date),
    );
    pastDates = pastDates.filter((d) => !recordedDates.has(d));
  }

  const dates = [...pastDates, ...futureDates];
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
