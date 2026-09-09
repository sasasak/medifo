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
