'use client';

import { createClient } from '@/utils/supabase/client';
import { Plus } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import TimeItem from './TimeItem';
import { useRouter } from 'next/navigation';
import { regenerateIntakeLogsAction } from '../regenerateIntakeLogsAction';
import {
  medicineRegisterSchema,
  type RepeatType,
} from '@/schemas/medicineRegisterSchema';

const REPEAT_TYPE_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'daily', label: '매일 반복' },
  { value: 'once', label: '특정 날짜 1회' },
];

const FREQUENCY_LABEL: Record<RepeatType, string> = {
  daily: '매일',
  once: '1회',
};

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface MedicineRegisterProps {
  medicineId: string;
  userId: string;
  existingData?: {
    id: string;
    times: string[];
    frequency: string;
    repeatType: RepeatType;
    startDate: string;
  } | null;
}

export default function MedicineRegister({
  medicineId,
  userId,
  existingData,
}: MedicineRegisterProps) {
  const [times, setTimes] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [startDate, setStartDate] = useState(() => toDateString(new Date()));
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (existingData?.times) {
      setTimes(existingData.times);
    }
    if (existingData?.repeatType) {
      setRepeatType(existingData.repeatType);
    }
    if (existingData?.startDate) {
      setStartDate(existingData.startDate);
    }
  }, [existingData]);

  const handleAddTime = () => {
    setTimes((prev) => [...prev, '']);
  };

  const handleRemoveTime = (index: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const isDuplicate = times.some((t, i) => i !== index && t === value);
    if (isDuplicate) {
      setErrorMessage('이미 추가된 시간입니다.');
      return;
    }

    setErrorMessage('');
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const handleRegister = () => {
    const parsed = medicineRegisterSchema.safeParse({
      repeatType,
      startDate,
      times,
    });

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.',
      );
      return;
    }

    setErrorMessage('');

    startTransition(async () => {
      const supabase = createClient();
      let userMedicineId = existingData?.id;
      const frequency = FREQUENCY_LABEL[repeatType];

      if (existingData) {
        const { error } = await supabase
          .from('user_medicines')
          .update({
            times,
            frequency,
            repeat_type: repeatType,
            start_date: startDate,
          })
          .eq('id', existingData.id);

        if (error) {
          setErrorMessage('수정에 실패했습니다. 다시 시도해주세요.');
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('user_medicines')
          .insert({
            user_id: userId,
            medicine_id: medicineId,
            frequency,
            repeat_type: repeatType,
            start_date: startDate,
            times,
            is_active: true,
          })
          .select('id')
          .single();

        if (error || !data) {
          setErrorMessage('등록에 실패했습니다. 다시 시도해주세요.');
          return;
        }
        userMedicineId = data.id;
      }

      const result = await regenerateIntakeLogsAction(
        userMedicineId!,
        times,
        startDate,
        repeatType,
      );
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      router.push('/my-medicines?registered=true');
    });
  };

  return (
    <div className="bg-card border-border-light mt-4 rounded-2xl border p-6">
      <span>복용 주기</span>
      <div className="mt-2 flex gap-2">
        {REPEAT_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRepeatType(option.value)}
            className={`flex-1 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
              repeatType === option.value
                ? 'bg-button text-text-reverse-base border-button'
                : 'border-border-light text-text-muted hover:bg-card-muted'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <span>시작 날짜</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border-border-light mt-2 w-full rounded-lg border p-2 text-sm outline-none"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span>복용 시간 설정</span>
        <button
          type="button"
          onClick={handleAddTime}
          className="border-border-light text-text-muted hover:bg-card-muted flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2"
        >
          <Plus size={16} />
          시간 추가
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {times.map((time, index) => (
          <TimeItem
            key={index}
            time={time}
            index={index}
            onChange={handleTimeChange}
            onRemove={handleRemoveTime}
          />
        ))}
      </div>
      {errorMessage && (
        <p className="text-danger-400 mt-2 text-sm">{errorMessage}</p>
      )}
      <button
        type="button"
        onClick={handleRegister}
        disabled={isPending}
        className="bg-button text-text-reverse-base hover:bg-hover-color mt-4 w-full cursor-pointer rounded-full py-4 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? '처리 중...'
          : existingData
            ? '+ 복용 시간 수정'
            : '+ 복용 약에 추가'}
      </button>
    </div>
  );
}
