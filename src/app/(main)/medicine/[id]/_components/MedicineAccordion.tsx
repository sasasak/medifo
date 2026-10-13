'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type AccordionVariant = 'default' | 'warning' | 'danger';

interface AccordionItemProps {
  title: string;
  content: string;
  variant?: AccordionVariant;
  defaultOpen?: boolean;
}

const variantStyles: Record<
  AccordionVariant,
  { container: string; title: string }
> = {
  default: { container: 'bg-card border-border-light', title: '' },
  warning: {
    container: 'bg-warning-50/50 border-warning-200 warning-bg',
    title: 'text-warning-400',
  },
  danger: {
    container: 'bg-card border-danger-border',
    title: 'text-danger-400',
  },
};

function AccordionItem({
  title,
  content,
  variant = 'default',
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-2xl border p-4 ${styles.container}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <span className={`font-bold ${styles.title}`}>{title}</span>
        {isOpen ? (
          <ChevronDown size={18} className="text-text-muted" />
        ) : (
          <ChevronRight size={18} className="text-text-muted" />
        )}
      </button>
      {isOpen && (
        <p className="text-text-muted mt-3 text-sm whitespace-pre-line">
          {content}
        </p>
      )}
    </div>
  );
}
interface MedicineAccordionProps {
  efficacy: string | null;
  usage: string | null;
  warnings: string | null;
  precautions: string | null;
  interactions: string | null;
  sideEffects: string | null;
  storage: string | null;
}

export default function MedicineAccordionProps({
  efficacy,
  usage,
  warnings,
  precautions,
  interactions,
  sideEffects,
  storage,
}: MedicineAccordionProps) {
  // e약은요 데이터는 항목별로 비어 있는 경우가 많아(경고 76%, 상호작용 30%) 값이 있는 항목만 노출
  // 복용 전 꼭 읽어야 하는 복용 방법/주의사항만 기본으로 펼쳐둔다 (효능은 상단 카드에 이미 노출되어 접어둠)
  const items: {
    title: string;
    content: string | null;
    variant?: AccordionVariant;
    defaultOpen?: boolean;
  }[] = [
    { title: '효능/효과', content: efficacy },
    { title: '복용 방법', content: usage, defaultOpen: true },
    {
      title: '주의사항',
      content: precautions,
      variant: 'warning',
      defaultOpen: true,
    },
    { title: '주의사항 경고', content: warnings, variant: 'danger' },
    { title: '상호작용', content: interactions, variant: 'warning' },
    { title: '부작용', content: sideEffects, variant: 'warning' },
    { title: '보관 방법', content: storage },
  ];
  const visibleItems = items.filter(
    (item): item is AccordionItemProps => !!item.content,
  );

  return (
    <div className="flex flex-col gap-3 py-3">
      {visibleItems.map((item) => (
        <AccordionItem
          key={item.title}
          title={item.title}
          content={item.content}
          variant={item.variant}
          defaultOpen={item.defaultOpen}
        />
      ))}
    </div>
  );
}
