import type { SupabaseClient } from '@supabase/supabase-js';

const SCHEDULE_DAYS = 90;

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface RegenerateScheduleParams {
  userId: string;
  userMedicineId: string;
  times: string[];
}

// 약 등록/시간 수정 시 호출: 아직 복용하지 않은(pending) 오늘 이후 일정을 지우고
// 새 시간대로 향후 SCHEDULE_DAYS일치를 다시 생성한다. 이미 taken 처리된 기록은 건드리지 않는다.
export async function regenerateSchedule(
  supabase: SupabaseClient,
  { userId, userMedicineId, times }: RegenerateScheduleParams,
) {
  const today = new Date();
  const todayStr = toDateString(today);

  const { error: deleteError } = await supabase
    .from('intake_logs')
    .delete()
    .eq('user_medicine_id', userMedicineId)
    .eq('status', 'pending')
    .gte('scheduled_date', todayStr);

  if (deleteError) throw deleteError;

  if (times.length === 0) return;

  const rows = Array.from({ length: SCHEDULE_DAYS }).flatMap((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const scheduled_date = toDateString(date);

    return times.map((scheduled_time) => ({
      user_id: userId,
      user_medicine_id: userMedicineId,
      scheduled_date,
      scheduled_time,
      status: 'pending',
    }));
  });

  const { error: insertError } = await supabase
    .from('intake_logs')
    .upsert(rows, {
      onConflict: 'user_medicine_id,scheduled_date,scheduled_time',
      ignoreDuplicates: true,
    });

  if (insertError) throw insertError;
}
