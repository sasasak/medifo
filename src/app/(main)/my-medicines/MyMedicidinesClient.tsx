'use client';

import Toast from '@/components/ui/Toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyMedicineClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRegistered = searchParams.get('registered') === 'true';
  const [showToast, setShowToast] = useState(isRegistered);

  useEffect(() => {
    if (isRegistered) {
      router.replace('/my-medicines');
    }
  }, [isRegistered, router]);
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
