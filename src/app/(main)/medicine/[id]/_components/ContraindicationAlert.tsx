import { AlertTriangle } from 'lucide-react';

interface ContraindicationAlertProps {
  contraindications: string;
}

export default function ContraindicationAlert({
  contraindications,
}: ContraindicationAlertProps) {
  if (!contraindications) return null;
  return (
    <div className="bg-card border-danger-border mt-4 rounded-2xl border p-6">
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="text-danger-400 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-2">
          <span className="text-danger-400 font-bold">병용금기 안내</span>
          {contraindications.split(',').map((item) => (
            <p key={item} className="text-text-muted text-sm">
              {item.trim()}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
