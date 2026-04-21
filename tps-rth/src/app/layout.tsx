import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
