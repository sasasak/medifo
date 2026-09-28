import { TrendingUp } from 'lucide-react';

interface PopularMedicinesProps {
  keywords: string[];
  onSelect: (keyword: string) => void;
}

export default function PopularMedicines({
  keywords,
  onSelect,
}: PopularMedicinesProps) {
  if (keywords.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-text-muted" />
        <span className="text-lg font-bold">많이 찾는 약</span>
      </div>
      <ul className="bg-card border-border-light mt-3 rounded-2xl border">
        {keywords.map((keyword, index) => (
          <li
            key={keyword}
            className="border-border-light border-b last:border-none"
          >
            <button
              type="button"
              onClick={() => onSelect(keyword)}
              className="hover:bg-card-muted flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors"
            >
              <span className="text-text-muted w-4">{index + 1}</span>
              <span>{keyword}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
