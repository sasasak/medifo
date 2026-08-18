import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import MedicineInfo from './_components/MedicineInfo';
import MedicineAccordion from './_components/MedicineAccordion';
import ContraindicationAlert from './_components/ContraindicationAlert';
import MedicineRegister from './_components/MedicineRegister';

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

  const { data: medicine } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();

  if (!medicine) notFound();

  const { data: existingMedicine } = await supabase
    .from('user_medicines')
    .select('id, times, frequency')
    .eq('user_id', user?.id)
    .eq('medicine_id', id)
    .limit(1)
    .single();

  console.log('existingMedicine:', existingMedicine);
  console.log('type:', typeof existingMedicine);

  return (
    <section className="p-6">
      <MedicineInfo
        name={medicine.name}
        manufacturer={medicine.manufacturer}
        efficacy={medicine.efficacy}
      />
      <ContraindicationAlert contraindications={medicine.contraindications} />
      <MedicineAccordion
        efficacy={medicine.efficacy}
        usage={medicine.usage}
        precautions={medicine.precautions}
        sideEffects={medicine.side_effects}
        storage={medicine.storage}
      />
      <MedicineRegister
        medicineId={id}
        userId={user?.id ?? ''}
        existingData={existingMedicine}
      />
    </section>
  );
}
