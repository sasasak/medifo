'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import TimeItem from './TimeItem';

export default function MedicineRegister() {
  // 1. 초기 상태를 빈 배열([])로 수정
  const [times, setTimes] = useState<string[]>([]);

  // 2. 시간 추가 시 고정값('08:00') 대신 빈 문자열('')을 추가하여 직접 선택 가능하게 변경
  const handleAddTime = () => {
    setTimes((prev) => [...prev, '']);
  };

  const handleRemoveTime = (index: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
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
      {/* TODO: 추후 복용 약 등록 로직 연결 */}
      <button
        type="button"
        className="bg-button text-text-reverse-base hover:bg-hover-color mt-4 w-full cursor-pointer rounded-full py-4 font-bold transition-colors"
      >
        + 복용 약에 추가
      </button>
    </div>
  );
}
