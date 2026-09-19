import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export const metadata: Metadata = {
  title: "KisanOS AI — मिट्टी से मंडी तक",
  description: "One Farmer. One Farm. One Connected Platform. Empowering Indian agriculture from pre-sowing to final sale.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col antialiased">
        <Providers>
          <TopBar />
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 mb-20 md:mb-8">
            {children}
          </main>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
