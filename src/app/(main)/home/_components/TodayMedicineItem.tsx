'use client';

import { Check, Pill } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Toast from '@/components/ui/Toast';
import { toggleIntakeLogAction } from '../toggleIntakeLogAction';

interface TodayMedicineItemProps {
  userMedicineId: string;
  medicineId: string;
  name: string;
  times: string[];
  scheduledDate: string;
  takenTimes: string[];
  editable?: boolean;
}

export default function TodayMedicineItem({
  userMedicineId,
  medicineId,
  name,
  times,
  scheduledDate,
  takenTimes,
  editable = true,
}: TodayMedicineItemProps) {
  const router = useRouter();
  const [taken, setTaken] = useState(new Set(takenTimes));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent, time: string) => {
    e.stopPropagation();
    if (!editable) {
      setErrorMessage('수정 가능한 기간(최근 7일)이 지나 변경할 수 없어요.');
      return;
    }
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
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <>
      {errorMessage && (
        <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
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
                aria-disabled={!editable}
                onClick={(e) => handleToggle(e, time)}
                title={
                  editable
                    ? `${time} 복용 ${isTaken ? '완료 취소' : '완료 체크'}`
                    : '수정 가능한 기간이 지났어요'
                }
                className={`flex aspect-square w-7 items-center justify-center rounded-full border transition-colors ${
                  !editable
                    ? 'border-border-light text-text-muted cursor-not-allowed opacity-50'
                    : isTaken
                      ? 'bg-primary-400 border-primary-400 cursor-pointer text-white'
                      : 'border-border-light text-text-muted hover:bg-card-muted cursor-pointer'
                }`}
              >
                <Check size={14} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
