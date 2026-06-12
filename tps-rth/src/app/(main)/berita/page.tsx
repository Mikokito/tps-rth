import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import type { NewsItem } from "@/data/news";
import BeritaList from "./BeritaList";

export const metadata: Metadata = {
  title: "Berita & Pengumuman",
  description: "Informasi terkini, pengumuman, dan artikel edukasi dari TPS RTH Cikaret.",
};

export default async function BeritaPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("berita")
    .select("id, title, excerpt, content, category, tanggal, image_url")
    .order("tanggal", { ascending: false });

  const news: NewsItem[] = (data as NewsItem[]) ?? [];

  return (
    <>
      {/* Page hero */}
      <section className="relative px-4 bg-[#2F855A] text-white py-14 overflow-hidden">
        <img
          src="/webp/Berita.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">Berita &amp; Pengumuman</h1>
          <p className="text-white font-medium max-w-xl leading-relaxed [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Informasi terkini, pengumuman, dan artikel edukasi seputar pengelolaan sampah dari TPS RTH Cikaret.
          </p>
        </div>
      </section>

      <BeritaList news={news} />
    </>
  );
}
