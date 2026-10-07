// 약 검색 로딩 화면
// 최근 검색어는 화면이 뜬 뒤 브라우저에서 불러오고 기록이 없으면 보이지 않아 스켈레톤에서 뺀다.
export default function SearchLoading() {
  return (
    <section role="status" aria-live="polite" className="mx-6 animate-pulse">
      <span className="sr-only">페이지를 불러오는 중이에요</span>

      <div className="bg-card-muted mt-2 mb-10 h-8 w-28 rounded-lg" />

      <div className="flex flex-col gap-6">
        <div className="bg-card border-border-light h-12 rounded-2xl border" />

        <div>
          <div className="bg-card-muted h-6 w-28 rounded-lg" />
          <ul className="bg-card border-border-light mt-3 rounded-2xl border">
            {Array.from({ length: 8 }, (_, i) => (
              <li
                key={i}
                className="border-border-light flex items-center gap-4 border-b px-5 py-4 last:border-none"
              >
                <div className="bg-card-muted h-4 w-4 rounded" />
                <div className="bg-card-muted h-4 w-32 rounded" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
