import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

const DUMMY_POPULAR = [
  '타이레놀',
  '판콜',
  '비타민',
  '오메가3',
  '소화제',
  '진통제',
  '항생제',
  '비타민C',
];

export default function PopularMedicines() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-text-muted" />
        <span className="text-lg font-bold">많이 찾는 약</span>
      </div>
      <ul className="bg-card border-border-light mt-3 rounded-2xl border">
        {DUMMY_POPULAR.map((name, index) => (
          <li
            key={name}
            className="border-border-light border-b last:border-none"
          >
            {/* TODO: 추후 약 상세 페이지 라우팅 연결 */}
            <Link
              href={`/search/${name}`}
              className="hover:bg-card-muted flex items-center gap-4 px-5 py-4 transition-colors"
            >
              <span className="text-text-muted w-4">{index + 1}</span>
              <span className="">{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
