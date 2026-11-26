/**
 * 체험 계정 설정 (서버 전용)
 *
 * ⚠️ 서버 액션, 서버 컴포넌트에서만 import 할 것.
 * NEXT_PUBLIC 접두어가 없는 환경변수라 브라우저 코드에서는 값이 비어 있음.
 * 환경변수가 없으면 체험 계정이 없는 것으로 처리함.
 */

type DemoCredentials = { email: string; password: string };

export function getDemoCredentials(): DemoCredentials | null {
  const email = process.env.DEMO_USER_EMAIL?.trim();
  const password = process.env.DEMO_USER_PASSWORD;

  if (!email || !password) return null;

  return { email, password };
}

// 이메일은 대소문자를 구분하지 않고 비교함
export function isDemoUser(email: string | null | undefined): boolean {
  const demoEmail = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();

  if (!demoEmail || !email) return false;

  return email.trim().toLowerCase() === demoEmail;
}
