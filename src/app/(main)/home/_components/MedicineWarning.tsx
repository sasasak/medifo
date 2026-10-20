import MedicineWarningCard from './MedicineWarningCard';
import { getPopularMedicines } from '../getPopularMedicines';

export default async function MedicineWarnings() {
  const warnings = await getPopularMedicines();

  if (warnings.length === 0) return null;

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
