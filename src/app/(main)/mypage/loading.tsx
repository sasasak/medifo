// 마이페이지 로딩 화면
export default function MyPageLoading() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="mx-6 flex animate-pulse flex-col gap-6"
    >
      <span className="sr-only">페이지를 불러오는 중이에요</span>

      <div className="bg-card-muted h-7 w-28 rounded-lg" />

      <div className="bg-card border-card-border flex items-center justify-between rounded-2xl border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-card-muted h-11 w-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="bg-card-muted h-4 w-24 rounded" />
            <div className="bg-card-muted h-4 w-40 rounded" />
          </div>
        </div>
        <div className="border-card-border h-9 w-20 rounded-xl border" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-card-muted mx-1 h-4 w-10 rounded" />
        <div className="bg-card border-card-border divide-border-light divide-y rounded-2xl border">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-5">
              <div className="bg-card-muted h-4 w-24 rounded" />
              <div className="bg-card-muted h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-card-muted mx-1 h-4 w-10 rounded" />
        <div className="bg-card border-card-border rounded-2xl border px-5 py-4">
          <div className="bg-card-muted h-4 w-20 rounded" />
        </div>
      </div>
    </section>
  );
}
