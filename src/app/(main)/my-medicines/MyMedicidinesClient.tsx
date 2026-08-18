'use client';

import Toast from '@/components/ui/Toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyMedicineClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowToast(true);
      router.replace('/my-medicines');
    }
  }, [searchParams, router]);
  return (
    <>
      {showToast && (
        <Toast
          message="복용 약에 추가되었습니다!"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
