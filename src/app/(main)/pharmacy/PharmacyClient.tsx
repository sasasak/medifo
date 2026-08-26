'use client';

import { useState } from 'react';
import KakaoMap from './_components/KakaoMap';
import PharmacySearchBar from './_components/PharmacySearchBar';

export default function PharmacyClient() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <PharmacySearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <KakaoMap searchQuery={searchQuery} />
    </div>
  );
}
