'use client';

import { Search } from 'lucide-react';

interface PharmacySearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function PharmacySearchBar({
  searchQuery,
  setSearchQuery,
}: PharmacySearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Search size={18} className="text-text-muted absolute left-4" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="지역을 검색하세요"
        className="bg-card border-border-light focus:border-border-focus w-full rounded-2xl border py-3 pr-10 pl-10 text-sm outline-none"
      />
    </div>
  );
}
