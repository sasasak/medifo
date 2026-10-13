// (main) 페이지 공용 로딩 화면
// 서버 응답을 기다리는 동안 사이드바는 유지하고 본문 자리에 스켈레톤을 보여준다.
// 특정 페이지 모양에 맞추지 않고 제목 줄과 본문 블록만 둔다. 홈은 home/loading.tsx를 쓴다.
export default function MainLoading() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="mx-6 flex animate-pulse flex-col gap-6"
    >
      <span className="sr-only">페이지를 불러오는 중이에요</span>

      <div className="bg-card-muted mt-2 h-8 w-48 rounded-lg" />

      <div className="bg-card border-border-light flex flex-col gap-4 rounded-2xl border p-6">
        <div className="bg-card-muted h-5 w-3/4 rounded-lg" />
        <div className="bg-card-muted h-5 w-full rounded-lg" />
        <div className="bg-card-muted h-5 w-2/3 rounded-lg" />
      </div>

      <div className="bg-card border-border-light h-40 rounded-2xl border" />
    </section>
  );
}
