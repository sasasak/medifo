import { createClient } from '@/utils/supabase/server';
import SearchClient from './SearchClient';

export default async function Search() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: 실제 서비스 데이터가 쌓이면 검색/등록 건수 기준
  // 인기순 정렬로 교체 (현재는 테스트 데이터가 적어 의미 있는 집계 불가)
  const { data: popularMedicines } = await supabase
    .from('medicines')
    .select('id, name')
    .limit(8);

  return (
    <div className="mx-6">
      <h2 className="mt-2 mb-10 text-2xl">약 검색</h2>
      <div>
        <SearchClient
          userId={user?.id ?? ''}
          popularMedicines={popularMedicines ?? []}
        />
      </div>
    </div>
  );
}
