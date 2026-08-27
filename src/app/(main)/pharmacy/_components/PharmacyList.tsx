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
}

export default function PharmacyList({ pharmacies }: PharmacyListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold">주변 약국 {pharmacies.length}곳</h2>
      {pharmacies.map((pharmacy) => (
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
