/**
 * 1회성 백필 스크립트
 *
 * intake_logs 기능 도입 이전에 이미 등록된 활성(is_active=true) user_medicines에 대해
 * 향후 90일치 pending 일정을 생성한다. 이후 신규 등록/수정은 regenerateIntakeLogsAction이
 * 처리하므로 이 스크립트는 배포 전 한 번만 실행하면 된다. (upsert 기반이라 재실행해도 안전)
 *
 * 실행: npx tsx --env-file=.env.local scripts/backfillIntakeLogs.ts
 */
import { createAdminClient } from '../src/utils/supabase/admin';
import { regenerateSchedule } from '../src/utils/intakeLogs/regenerateSchedule';

async function main() {
  const supabase = createAdminClient();

  const { data: userMedicines, error } = await supabase
    .from('user_medicines')
    .select('id, user_id, times')
    .eq('is_active', true);

  if (error) {
    console.error('user_medicines 조회 실패:', error.message);
    process.exit(1);
  }

  console.log(`대상 user_medicines: ${userMedicines?.length ?? 0}건`);

  let successCount = 0;
  let failCount = 0;

  for (const userMedicine of userMedicines ?? []) {
    try {
      await regenerateSchedule(supabase, {
        userId: userMedicine.user_id,
        userMedicineId: userMedicine.id,
        times: userMedicine.times ?? [],
      });
      successCount += 1;
    } catch (err) {
      failCount += 1;
      console.error(`실패 (user_medicine_id: ${userMedicine.id}):`, err);
    }
  }

  console.log(`완료: 성공 ${successCount}건, 실패 ${failCount}건`);
}

main();
