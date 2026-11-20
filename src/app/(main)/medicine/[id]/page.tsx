import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import MedicineInfo from './_components/MedicineInfo';
import MedicineAccordion from './_components/MedicineAccordion';
import ContraindicationAlert from './_components/ContraindicationAlert';
import MedicineRegister from './_components/MedicineRegister';
import BackButton from './_components/BackButton';
import { getContraindicationInfo } from './getContraindicationInfo';

interface MedicineDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicineDetailPage({
  params,
}: MedicineDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 세 조회 모두 약 id와 사용자 id만 필요해 함께 보낸다
  const [{ data: medicine }, { data: existingMedicine }, contraindicationInfo] =
    await Promise.all([
      supabase.from('medicines').select('*').eq('id', id).single(),
      // 복용 종료한 행은 불러오지 않아 신규 등록 화면으로 열림 (다시 복용하면 새 행으로 등록)
      supabase
        .from('user_medicines')
        .select('id, times, frequency, repeat_type, start_date')
        .eq('user_id', user?.id)
        .eq('medicine_id', id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle(),
      getContraindicationInfo(supabase, id),
    ]);

  if (!medicine) notFound();

  return (
    <section className="p-6">
      <BackButton name={medicine.name} />
      <MedicineInfo
        name={medicine.name}
        manufacturer={medicine.manufacturer}
        efficacy={medicine.efficacy}
        imageUrl={medicine.image_url}
      />
      <ContraindicationAlert info={contraindicationInfo} />
      <MedicineAccordion
        efficacy={medicine.efficacy}
        usage={medicine.usage}
        warnings={medicine.warnings}
        precautions={medicine.precautions}
        interactions={medicine.interactions}
        sideEffects={medicine.side_effects}
        storage={medicine.storage}
      />
      <MedicineRegister
        medicineId={id}
        userId={user?.id ?? ''}
        existingData={
          existingMedicine
            ? {
                id: existingMedicine.id,
                times: existingMedicine.times,
                frequency: existingMedicine.frequency,
                repeatType: existingMedicine.repeat_type,
                startDate: existingMedicine.start_date,
              }
            : null
        }
      />
    </section>
  );
}
