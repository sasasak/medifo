import { ZodError } from 'zod';

// ZodError → 필드별 첫 번째 에러 메시지만 추린 객체로 변환
// 예: { errors: { email: '...', password: '...' } } 형태로 사용
export function toFieldErrors<T extends Record<string, unknown>>(
  error: ZodError<T>,
): Partial<Record<keyof T, string>> {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => [field, messages![0]]),
  ) as Partial<Record<keyof T, string>>;
}
