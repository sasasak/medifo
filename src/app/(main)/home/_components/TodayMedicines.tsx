import { Pill, Plus } from 'lucide-react';

// 오늘 복용할 약 분리 컴포넌트
// TODO: 추후 실제 데이터로 복용 약 정보가 들어오면 리스트 렌더링
// 리스트 렌더링 시에 퍼블리싱 + 로직 함께 작성
export default function TodayMedicines() {
  return (
    <div className="bg-card border-border-light min-h-100 flex-1 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">오늘 복용할 약</h2>
        <button
          type="button"
          className="hover:bg-card-muted border-border-light text-text-muted flex cursor-pointer items-center gap-1 rounded-4xl border p-3 text-sm transition-colors"
        >
          <Plus size={20} /> 약 추가하기
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 pt-10">
        <div className="bg-card-muted flex aspect-square w-15 items-center justify-center rounded-full">
          <Pill size={30} className="text-text-muted" />
        </div>
        <p className="text-sm">오늘 예정된 복약이 없어요</p>
      </div>
    </div>
  );
}
