// 약 상세 로딩 화면
// 병용금기 안내는 해당 약에만 나오는 영역이라 스켈레톤에서 뺀다.
// 아코디언 항목 수는 약마다 1~7개로 달라 중간값인 4줄로 둔다.
export default function MedicineDetailLoading() {
  return (
    <section role="status" aria-live="polite" className="animate-pulse p-6">
      <span className="sr-only">페이지를 불러오는 중이에요</span>

      <div className="mb-4 flex items-center gap-2">
        <div className="bg-card-muted h-6 w-6 rounded" />
        <div className="bg-card-muted h-7 w-48 rounded-lg" />
      </div>

      <div className="bg-card border-border-light flex items-center gap-6 rounded-2xl border p-10">
        <div className="bg-card-muted h-40 w-40 shrink-0 rounded-xl" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="bg-card-muted h-7 w-1/2 rounded-lg" />
          <div className="bg-card-muted h-5 w-1/3 rounded" />
          <div className="bg-card-muted h-5 w-3/4 rounded" />
        </div>
      </div>

      <div className="flex flex-col gap-3 py-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-card border-border-light rounded-2xl border p-4"
          >
            <div className="bg-card-muted h-5 w-28 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-card border-border-light mt-4 flex flex-col gap-4 rounded-2xl border p-6">
        <div className="bg-card-muted h-6 w-32 rounded-lg" />
        <div className="bg-card-muted h-10 rounded-full" />
        <div className="bg-card-muted h-10 rounded-lg" />
        <div className="bg-card-muted h-14 rounded-full" />
      </div>
    </section>
  );
}
