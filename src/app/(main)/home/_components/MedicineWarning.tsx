import MedicineWarningCard from './MedicineWarningCard';

// TODO:추후 실제 DB 데이터로 교체
const DUMMY_WARNINGS = [
  { name: '타이레놀', description: '간질환자 신중 투여, 알코올 병용 금지' },
  { name: '판콜', description: '고혈압 환자 신중 투여' },
  { name: '이지엔 6', description: '간질환자 신중 투여' },
  { name: '타가멧', description: '신장애 환자 신중 투여' },
  { name: '비타민 C', description: '결석 병력 신중 투여' },
];

export default function MedicineWarnings() {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold">많이 복용하는 약 주의사항</h2>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {DUMMY_WARNINGS.map((warning) => (
          <MedicineWarningCard
            key={warning.name}
            name={warning.name}
            description={warning.description}
          />
        ))}
      </div>
    </div>
  );
}
