import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * service_role(Secret key) 기반 관리자 클라이언트
 *
 * ⚠️ 절대 클라이언트 컴포넌트나 브라우저로 전송되는 코드에서 import 하지 말 것.
 * 반드시 'use server' 액션, 서버 전용 API 라우트, 서버 전용 조회(unstable_cache 캐시 함수)에서만 사용해야 함.
 * RLS를 우회하므로 admin 권한이 꼭 필요한 작업에만 사용.
 *   - auth.users 삭제 (withdrawAction)
 *   - service_role에만 실행 권한이 있는 집계 함수 호출 (getPopularKeywords, getPopularMedicines)
 *     쿠키를 읽지 않아 캐시 함수 안에서 호출할 수 있음
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
