import { createClient } from '@/utils/supabase/server';
import MedicineWarningCard from './MedicineWarningCard';

// TODO: 실제 서비스 데이터가 쌓이면 user_medicines 등록 건수 기준
// 인기순 정렬로 교체 (현재는 테스트 데이터가 적어 의미 있는 집계 불가)
export default async function MedicineWarnings() {
  const supabase = await createClient();
  const { data: warnings } = await supabase
    .from('medicines')
    .select('id, name, precautions')
    .not('precautions', 'is', null)
    // TODO: 테스트 데이터 5건(synced_at 없음) 정리 후 이 조건 제거
    // 정렬 없이 limit만 걸려 있어 먼저 저장된 가짜 약이 노출되는 것을 임시로 막는 용도
    .not('synced_at', 'is', null)
    .limit(5);

  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold">많이 복용하는 약 주의사항</h2>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {warnings.map((warning) => (
          <MedicineWarningCard
            key={warning.id}
            id={warning.id}
            name={warning.name}
            description={warning.precautions}
          />
        ))}
      </div>
    </div>
  );
}
