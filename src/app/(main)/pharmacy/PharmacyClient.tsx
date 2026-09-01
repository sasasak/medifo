'use client';

import { useState } from 'react';
import KakaoMap from './_components/KakaoMap';
import PharmacySearchBar from './_components/PharmacySearchBar';
import PharmacyList from './_components/PharmacyList';

interface SelectedPlace {
  id: string;
  name: string;
  x: string;
  y: string;
  place_name: string;
  address_name: string;
  phone: string;
}

export default function PharmacyClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmedQuery, setConfirmedQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null,
  );
  const [pharmacies, setPharmacies] = useState<any[]>([]);

  const handleSearch = () => {
    setConfirmedQuery(searchQuery);
    setSelectedPlace(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <PharmacySearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectPlace={(place) => setSelectedPlace(place)}
        onSearch={handleSearch}
      />
      <KakaoMap
        confirmedQuery={confirmedQuery}
        selectedPlace={selectedPlace}
        onPharmaciesFound={setPharmacies}
      />
      {pharmacies.length > 0 && (
        <PharmacyList pharmacies={pharmacies} isNearbyMode={!!selectedPlace} />
      )}
    </div>
  );
}
