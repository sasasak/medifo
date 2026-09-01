import { Phone } from 'lucide-react';

interface Pharmacy {
  id: string;
  place_name: string;
  address_name: string;
  phone: string;
  distance: string;
}

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  isNearbyMode?: boolean; // 약국 직접 선택 시 true
}

export default function PharmacyList({
  pharmacies,
  isNearbyMode,
}: PharmacyListProps) {
  const mainPharmacy = isNearbyMode ? pharmacies[0] : null;
  const list = isNearbyMode ? pharmacies.slice(1) : pharmacies;

  return (
    <div className="flex flex-col gap-3">
      {/* 선택한 약국 - 크게 */}
      {mainPharmacy && (
        <div className="bg-card border-border-focus rounded-2xl border-2 p-5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{mainPharmacy.place_name}</span>
            {mainPharmacy.phone && (
              <a
                href={`tel:${mainPharmacy.phone}`}
                className="text-text-muted cursor-pointer"
              >
                <Phone size={18} />
              </a>
            )}
          </div>
          <p className="text-text-muted mt-1 text-sm">
            {mainPharmacy.address_name}
          </p>
          {list.length > 0 && (
            <div className="border-border-light mt-4 border-t pt-4">
              <p className="text-text-muted mb-2 text-xs">주변 약국</p>
              <div className="flex flex-col gap-2">
                {list.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-bold">
                        {pharmacy.place_name}
                      </span>
                      <span className="text-text-muted ml-2 text-xs">
                        {Math.round(Number(pharmacy.distance))}m
                      </span>
                    </div>
                    {pharmacy.phone && (
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="text-text-muted cursor-pointer"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 지역 검색 결과 리스트 */}
      {!isNearbyMode &&
        list.map((pharmacy) => (
          <div
            key={pharmacy.id}
            className="bg-card border-border-light rounded-2xl border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{pharmacy.place_name}</span>
              {pharmacy.phone && (
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="text-text-muted cursor-pointer"
                >
                  <Phone size={16} />
                </a>
              )}
            </div>
            <div className="text-text-muted mt-1 flex items-center gap-2 text-sm">
              <span>{pharmacy.address_name}</span>
              {pharmacy.distance && (
                <>
                  <span>·</span>
                  <span>{Math.round(Number(pharmacy.distance))}m</span>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
