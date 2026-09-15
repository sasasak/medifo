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
        <div className="bg-card border-border-focus rounded-2xl border-2 p-5">
          <div
            onClick={() => onSelectPharmacy(mainPharmacy)}
            className="hover:bg-card-muted -m-2 cursor-pointer rounded-xl p-2 transition-colors"
          >
            <span className="text-lg font-bold">
              {mainPharmacy.place_name}
            </span>
            <div className="text-text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span>{mainPharmacy.address_name}</span>
              {mainPharmacy.phone && (
                <>
                  <span>·</span>
                  <a
                    href={`tel:${mainPharmacy.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-text-muted no-underline"
                  >
                    {mainPharmacy.phone}
                  </a>
                </>
              )}
            </div>
          </div>
          {list.length > 0 && (
            <div className="border-border-light mt-4 border-t pt-4">
              <p className="text-text-muted mb-2 text-xs">주변 약국</p>
              <div className="flex flex-col gap-2">
                {list.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    onClick={() => onSelectPharmacy(pharmacy)}
                    className="hover:bg-card-muted flex cursor-pointer items-center justify-between gap-2 rounded-xl p-2 transition-colors"
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
                        className="text-text-muted shrink-0 text-xs no-underline"
                      >
                        {pharmacy.phone}
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
            <span className="font-bold">{pharmacy.place_name}</span>
            <div className="text-text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span>{pharmacy.address_name}</span>
              {pharmacy.distance && (
                <>
                  <span>·</span>
                  <span>{Math.round(Number(pharmacy.distance))}m</span>
                </>
              )}
              {pharmacy.phone && (
                <>
                  <span>·</span>
                  <a
                    href={`tel:${pharmacy.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-text-muted no-underline"
                  >
                    {pharmacy.phone}
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
