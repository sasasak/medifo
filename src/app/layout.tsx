import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Medifo',
  description: '건강한 복약 관리의 시작',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
