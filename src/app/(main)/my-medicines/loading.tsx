// 복용 관리 로딩 화면
export default function MyMedicinesLoading() {
  return (
    <section role="status" aria-live="polite" className="animate-pulse p-6">
      <span className="sr-only">페이지를 불러오는 중이에요</span>

      <div className="flex items-center justify-between">
        <div className="bg-card-muted h-8 w-32 rounded-lg" />
        <div className="border-border-light h-9 w-24 rounded-full border" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-card border-border-light rounded-2xl border p-4"
          >
            <div className="bg-card-muted h-5 w-2/3 rounded" />
            <div className="bg-card-muted mt-3 h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
