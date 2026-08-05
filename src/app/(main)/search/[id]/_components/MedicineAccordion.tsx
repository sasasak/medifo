'use client';

import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AccordionItemProps {
  title: string;
  content: string;
}

function AccordionItem({ title, content }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card border-border-light rounded-2xl border p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <span className="font-bold">{title}</span>
        {isOpen ? (
          <ChevronDown size={18} className="text-text-muted" />
        ) : (
          <ChevronRight size={18} className="text-text-muted" />
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
    { title: '주의사항', content: precautions },
    { title: '부작용', content: sideEffects },
  ];

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <AccordionItem
            key={item.title}
            title={item.title}
            content={item.content}
          />
        ))}
      </div>
      <AccordionItem title="보관 방법" content={storage} />
    </div>
  );
}
