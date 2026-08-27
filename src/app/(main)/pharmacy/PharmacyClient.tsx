'use client';

import { useState } from 'react';
import KakaoMap from './_components/KakaoMap';
import PharmacySearchBar from './_components/PharmacySearchBar';
import PharmacyList from './_components/PharmacyList';

interface SelectedPlace {
  name: string;
  x: string;
  y: string;
}

export default function PharmacyClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null,
  );
  const [pharmacies, setPharmacies] = useState<any[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <PharmacySearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectPlace={(place) => setSelectedPlace(place)}
      />
      <KakaoMap
        searchQuery={searchQuery}
        selectedPlace={selectedPlace}
        onPharmaciesFound={setPharmacies}
      />
      {pharmacies.length > 0 && <PharmacyList pharmacies={pharmacies} />}
    </div>
  );
}
