'use client';

import { Check, Pill } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toggleIntakeLogAction } from '../toggleIntakeLogAction';

interface TodayMedicineItemProps {
  userMedicineId: string;
  medicineId: string;
  name: string;
  times: string[];
  scheduledDate: string;
  takenTimes: string[];
}

export default function TodayMedicineItem({
  userMedicineId,
  medicineId,
  name,
  times,
  scheduledDate,
  takenTimes,
}: TodayMedicineItemProps) {
  const router = useRouter();
  const [taken, setTaken] = useState(new Set(takenTimes));
  const [, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent, time: string) => {
    e.stopPropagation();
    const wasTaken = taken.has(time);

    setTaken((prev) => {
      const next = new Set(prev);
      if (wasTaken) next.delete(time);
      else next.add(time);
      return next;
    });

    startTransition(async () => {
      const result = await toggleIntakeLogAction({
        userMedicineId,
        scheduledDate,
        scheduledTime: time,
        nextStatus: wasTaken ? 'pending' : 'taken',
      });

      if (result.error) {
        setTaken((prev) => {
          const next = new Set(prev);
          if (wasTaken) next.add(time);
          else next.delete(time);
          return next;
        });
      }
    });
  };

  return (
    <div
      onClick={() => router.push(`/medicine/${medicineId}`)}
      className="border-border-light hover:bg-card-muted flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="bg-card-muted flex aspect-square w-9 items-center justify-center rounded-lg">
          <Pill size={18} className="text-text-muted" />
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-text-muted text-xs">{times.join(', ')}</p>
        </div>
      </div>
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {times.map((time) => {
          const isTaken = taken.has(time);
          return (
            <button
              key={time}
              type="button"
              onClick={(e) => handleToggle(e, time)}
              title={`${time} 복용 ${isTaken ? '완료 취소' : '완료 체크'}`}
              className={`flex aspect-square w-7 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                isTaken
                  ? 'bg-primary-400 border-primary-400 text-white'
                  : 'border-border-light text-text-muted hover:bg-card-muted'
              }`}
            >
              <Check size={14} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
