import { createClient } from '@/utils/supabase/server';
import UserMedicineCard from './_components/UserMedicineCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function MyMedicinesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medicines } = await supabase
    .from('user_medicines')
    .select(
      `
      id,
      dosage,
      frequency,
      times,
      medicines (
        name
      )
    `,
    )
    .eq('user_id', user?.id)
    .eq('is_active', true);

  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 복용 약</h1>
        <Link
          href="/search"
          className="border-border-light hover:bg-card-muted flex cursor-pointer items-center gap-1 rounded-full border px-4 py-2 text-sm transition-colors"
        >
          <Plus size={16} />약 추가
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {medicines?.map((medicine) => (
          <UserMedicineCard
            key={medicine.id}
            id={medicine.id}
            name={
              (medicine.medicines as unknown as { name: string } | null)
                ?.name ?? ''
            }
            frequency={medicine.frequency}
            times={medicine.times}
            dosage={medicine.dosage}
          />
        ))}
      </div>
    </section>
  );
}
