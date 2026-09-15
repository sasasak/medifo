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

export type MapTarget =
  | { mode: 'region'; query: string }
  | { mode: 'pharmacy'; place: SelectedPlace }
  | { mode: 'idle' };

export default function PharmacyClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapTarget, setMapTarget] = useState<MapTarget>({ mode: 'idle' });
  const [pharmacies, setPharmacies] = useState<any[]>([]);

  const handleSearch = () => {
    setMapTarget({ mode: 'region', query: searchQuery });
  };

  const handleSelectPlace = (place: SelectedPlace) => {
    setMapTarget({ mode: 'pharmacy', place });
  };

  const handleSelectPharmacy = (pharmacy: any) => {
    setMapTarget({
      mode: 'pharmacy',
      place: {
        id: pharmacy.id,
        name: pharmacy.place_name,
        x: pharmacy.x,
        y: pharmacy.y,
        place_name: pharmacy.place_name,
        address_name: pharmacy.address_name,
        phone: pharmacy.phone,
      },
    });
  };

  const selectedPlace = mapTarget.mode === 'pharmacy' ? mapTarget.place : null;

  return (
    <div className="flex flex-col gap-4">
      <PharmacySearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectPlace={handleSelectPlace}
        onSearch={handleSearch}
      />
      <KakaoMap mapTarget={mapTarget} onPharmaciesFound={setPharmacies} />
      {pharmacies.length > 0 && (
        <PharmacyList
          pharmacies={pharmacies}
          isNearbyMode={!!selectedPlace}
          onSelectPharmacy={handleSelectPharmacy}
        />
      )}
    </div>
  );
}
