import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface PopularMedicine {
  id: string;
  name: string;
}

interface PopularMedicinesProps {
  medicines: PopularMedicine[];
}

export default function PopularMedicines({ medicines }: PopularMedicinesProps) {
  if (medicines.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-text-muted" />
        <span className="text-lg font-bold">많이 찾는 약</span>
      </div>
      <ul className="bg-card border-border-light mt-3 rounded-2xl border">
        {medicines.map((medicine, index) => (
          <li
            key={medicine.id}
            className="border-border-light border-b last:border-none"
          >
            <Link
              href={`/medicine/${medicine.id}`}
              className="hover:bg-card-muted flex items-center gap-4 px-5 py-4 transition-colors"
            >
              <span className="text-text-muted w-4">{index + 1}</span>
              <span className="">{medicine.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
