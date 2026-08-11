import { X } from 'lucide-react';
import { useRef } from 'react';

interface TimeItemProps {
  time: string;
  index: number;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export default function TimeItem({
  time,
  index,
  onChange,
  onRemove,
}: TimeItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="border-border-light flex cursor-pointer items-center gap-1 rounded-lg border p-2"
      onClick={() => inputRef.current?.showPicker()}
    >
      <input
        ref={inputRef}
        type="time"
        value={time}
        onChange={(e) => onChange(index, e.target.value)}
        className="border-none bg-transparent text-sm outline-none"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="text-text-muted cursor-pointer px-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
