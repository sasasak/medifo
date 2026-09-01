import { Phone } from 'lucide-react';

interface Pharmacy {
  id: string;
  place_name: string;
  address_name: string;
  phone: string;
  distance: string;
  x: string;
  y: string;
}

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  isNearbyMode?: boolean;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
}

export default function PharmacyList({
  pharmacies,
  isNearbyMode,
  onSelectPharmacy,
}: PharmacyListProps) {
  const mainPharmacy = isNearbyMode ? pharmacies[0] : null;
  const list = isNearbyMode ? pharmacies.slice(1) : pharmacies;

  return (
    <div className="flex flex-col gap-3">
      {mainPharmacy && (
        <div
          onClick={() => onSelectPharmacy(mainPharmacy)}
          className="bg-card border-border-focus hover:bg-card-muted cursor-pointer rounded-2xl border-2 p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{mainPharmacy.place_name}</span>
            {mainPharmacy.phone && (
              <a
                href={`tel:${mainPharmacy.phone}`}
                onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPharmacy(pharmacy);
                    }}
                    className="hover:bg-card-muted flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold">
                        {pharmacy.place_name}
                      </span>
                      {pharmacy.distance && (
                        <span className="text-text-muted ml-2 text-xs">
                          {Math.round(Number(pharmacy.distance))}m
                        </span>
                      )}
                    </div>
                    {pharmacy.phone && (
                      <a
                        href={`tel:${pharmacy.phone}`}
                        onClick={(e) => e.stopPropagation()}
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
      {!isNearbyMode &&
        list.map((pharmacy) => (
          <div
            key={pharmacy.id}
            onClick={() => onSelectPharmacy(pharmacy)}
            className="bg-card border-border-light hover:bg-card-muted cursor-pointer rounded-2xl border p-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{pharmacy.place_name}</span>
              {pharmacy.phone && (
                <a
                  href={`tel:${pharmacy.phone}`}
                  onClick={(e) => e.stopPropagation()}
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
