import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TPS RTH Cikaret — Pengelolaan Sampah Berbasis 3R",
    template: "%s | TPS RTH Cikaret",
  },
  description:
    "Tempat Pengelolaan Sampah Ruang Terbuka Hijau Cikaret, Kota Bogor. Kelola sampah, jaga lingkungan, dapat manfaat.",
  keywords: ["TPS", "RTH", "bank sampah", "pengelolaan sampah", "Bogor", "daur ulang", "3R"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-gray-900">{children}</body>
    </html>
  );
}
