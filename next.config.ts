import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;


 {/* 
  images.remotePatterns → Next.js <Image> 컴포넌트는 보안상 외부 도메인 이미지를 기본적으로 막아둠
  Supabase Storage에 올린 이미지를 쓰려면 이렇게 도메인을 허용 목록에 등록해야 함 
  Medifo도 나중에 Supabase Storage로 이미지(프로필 사진 등) 사용할 때 작성 필요 

  예시) 파이널 프로젝트 next.config.ts 파일

  const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xgiayrmzgokjzwwzivzi.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

  */}