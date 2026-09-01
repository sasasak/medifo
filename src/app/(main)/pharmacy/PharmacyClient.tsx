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

  const handleSelectPharmacy = (pharmacy: any) => {
    setSelectedPlace({
      id: pharmacy.id,
      name: pharmacy.place_name,
      x: pharmacy.x,
      y: pharmacy.y,
      place_name: pharmacy.place_name,
      address_name: pharmacy.address_name,
      phone: pharmacy.phone,
    });
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
        <PharmacyList
          pharmacies={pharmacies}
          isNearbyMode={!!selectedPlace}
          onSelectPharmacy={handleSelectPharmacy}
        />
      )}
    </div>
  );
}
