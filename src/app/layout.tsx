import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Medifo",
  description: "건강한 복약 관리의 시작",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/*  */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem >
        {children}
        </ThemeProvider></body>
    </html>
  );
}