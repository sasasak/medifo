'use client';

import { createClient } from '@/utils/supabase/client';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import TimeItem from './TimeItem';
import { useRouter } from 'next/navigation';

interface MedicineRegisterProps {
  medicineId: string;
  userId: string;
  existingData?: {
    id: string;
    times: string[];
    frequency: string;
  } | null;
}

export default function MedicineRegister({
  medicineId,
  userId,
  existingData,
}: MedicineRegisterProps) {
  const [times, setTimes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (existingData?.times) {
      setTimes(existingData.times);
    }
  }, [existingData]);

  const handleAddTime = () => {
    setTimes((prev) => [...prev, '']);
  };

  const handleRemoveTime = (index: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const handleRegister = async () => {
    if (times.length === 0) {
      setErrorMessage('복용 시간을 추가해주세요.');
      return;
    }

    if (times.some((time) => !time)) {
      setErrorMessage('복용 시간을 설정해주세요.');
      return;
    }

    setErrorMessage('');

    const supabase = createClient();

    if (existingData) {
      const { error } = await supabase
        .from('user_medicines')
        .update({ times, frequency: '매일' })
        .eq('id', existingData.id);

      if (error) {
        setErrorMessage('수정에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    } else {
      const { error } = await supabase.from('user_medicines').insert({
        user_id: userId,
        medicine_id: medicineId,
        frequency: '매일',
        times,
        is_active: true,
      });

      if (error) {
        setErrorMessage('등록에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    }

    router.push('/my-medicines?registered=true');
  };

  return (
    <div className="bg-card border-border-light mt-4 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
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
        className="bg-button text-text-reverse-base hover:bg-hover-color mt-4 w-full cursor-pointer rounded-full py-4 font-bold transition-colors"
      >
        {existingData ? '+ 복용 시간 수정' : '+ 복용 약에 추가'}
      </button>
    </div>
  );
}
