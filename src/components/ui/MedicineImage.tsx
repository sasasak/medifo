'use client';

import { Pill } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface MedicineImageProps {
  src: string | null;
  alt: string;
  iconSize: number;
  // 부모 컨테이너 크기 기준으로 next/image가 받아올 이미지 폭 힌트
  sizes: string;
}

// 낱알이미지가 없거나(수집분 약 42%) 로드에 실패하면 Pill 아이콘으로 대체
// 부모 요소에 relative + 크기 지정 필요 (next/image fill 사용)
export default function MedicineImage({
  src,
  alt,
  iconSize,
  sizes,
}: MedicineImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <Pill size={iconSize} className="text-text-muted" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-contain"
      onError={() => setFailedSrc(src)}
    />
  );
}
