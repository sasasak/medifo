// 홈 로딩 화면
// 서버 응답을 기다리는 동안 사이드바는 유지하고 본문 자리에 홈 모양 스켈레톤을 보여준다.
export default function HomeLoading() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="mx-6 flex animate-pulse flex-col gap-6"
    >
      <span className="sr-only">페이지를 불러오는 중이에요</span>

      <div className="bg-card-muted mt-2 h-8 w-48 rounded-lg" />

      <div className="flex gap-6">
        <div className="bg-card border-border-light flex min-h-80 flex-1 flex-col gap-4 rounded-2xl border p-6">
          <div className="bg-card-muted h-6 w-32 rounded-lg" />
          <div className="bg-card-muted h-14 rounded-xl" />
          <div className="bg-card-muted h-14 rounded-xl" />
          <div className="bg-card-muted h-14 rounded-xl" />
        </div>
        <div className="bg-card border-border-light hidden min-h-80 flex-1 flex-col gap-4 rounded-2xl border p-6 md:flex">
          <div className="bg-card-muted h-6 w-32 rounded-lg" />
          <div className="bg-card-muted flex-1 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-card border-border-light h-32 rounded-2xl border"
          />
        ))}
      </div>
    </section>
  );
}
