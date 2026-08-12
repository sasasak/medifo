'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AccordionItemProps {
  title: string;
  content: string;
  variant?: 'default' | 'warning';
}

function AccordionItem({
  title,
  content,
  variant = 'default',
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        variant === 'warning'
          ? 'bg-warning-50/50 border-warning-200 warning-bg'
          : 'bg-card border-border-light'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <span
          className={`font-bold ${variant === 'warning' ? 'text-warning-400' : ''}`}
        >
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={18} className="text-text-muted" />
        ) : (
          <ChevronDown size={18} className="text-text-muted" />
        )}
      </button>
      {isOpen && <p className="text-text-muted mt-3 text-sm">{content}</p>}
    </div>
  );
}
interface MedicineAccordionProps {
  efficacy: string;
  usage: string;
  precautions: string;
  sideEffects: string;
  storage: string;
}

export default function MedicineAccordionProps({
  efficacy,
  usage,
  precautions,
  sideEffects,
  storage,
}: MedicineAccordionProps) {
  const items = [
    { title: '효능/효과', content: efficacy },
    { title: '복용 방법', content: usage },
    { title: '주의사항', content: precautions, variant: 'warning' as const },
    { title: '부작용', content: sideEffects, variant: 'warning' as const },
  ];

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <AccordionItem
            key={item.title}
            title={item.title}
            content={item.content}
            variant={item.variant}
          />
        ))}
      </div>
      <AccordionItem title="보관 방법" content={storage} />
    </div>
  );
}
