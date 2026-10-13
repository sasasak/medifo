import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * service_role(Secret key) 기반 관리자 클라이언트
 *
 * ⚠️ 절대 클라이언트 컴포넌트나 브라우저로 전송되는 코드에서 import 하지 말 것.
 * 반드시 'use server' 액션 또는 서버 전용 API 라우트에서만 사용해야 함.
 * RLS를 우회하므로 auth.users 삭제처럼 admin 권한이 꼭 필요한 작업에만 사용.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
