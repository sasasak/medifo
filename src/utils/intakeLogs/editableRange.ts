// 과거 복용 기록을 수정할 수 있는 기간(오늘 기준 D-1 ~ D-7)과 약 시작 날짜 선택 범위의 기준
export const EDITABLE_PAST_DAYS = 7;

export const START_DATE_RANGE_MESSAGE = `시작 날짜는 오늘 기준 ${EDITABLE_PAST_DAYS}일 전까지만 선택할 수 있습니다.`;

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// 선택·수정 가능한 가장 이른 날짜 (오늘 - EDITABLE_PAST_DAYS)
export function getEditableFloor(todayStr: string): string {
  return addDays(todayStr, -EDITABLE_PAST_DAYS);
}
