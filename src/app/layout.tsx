import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { initializeSystem } from "@/db/actions/initialize";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "SpreadWord",
  description: "スプレッドワードアプリケーション",
};

// アプリケーション起動時に初期化処理を実行
initializeSystem().catch(console.error);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1456731181756528"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased min-h-screen `}
      >
        <SessionProvider>
          <Header />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
