import Link from "next/link";
import { ArrowRight, Users, Weight, Recycle, Building2, ChevronRight, Leaf } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import { newsData } from "@/data/news";
import { tpsInfo } from "@/data/tps";

const stats = [
  { label: "Nasabah Aktif", value: "1.247+", icon: Users, color: "text-[#2F855A]", bg: "bg-[#F0FFF4]" },
  { label: "Sampah/Bulan", value: "8,5 ton", icon: Weight, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Jenis Layanan", value: "3 jenis", icon: Recycle, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Mitra Bank Sampah", value: "5 mitra", icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function HomePage() {
  const latestNews = newsData.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#2F855A] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #48BB78 0%, transparent 50%), radial-gradient(circle at 80% 20%, #276749 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text content */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-white/20 rounded-full px-3 py-1 mb-6">
                <Leaf className="w-3.5 h-3.5" /> Pengelolaan Sampah Berbasis 3R
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Kelola Sampah,
                <br />
                Jaga Lingkungan,
                <br />
                <span className="text-[#9AE6B4]">Dapat Manfaat</span>
              </h1>
              <p className="text-lg text-green-100 leading-relaxed mb-8 max-w-xl">
                TPS RTH Cikaret hadir sebagai solusi pengelolaan sampah terpadu berbasis komunitas.
                Pilah sampahmu, setorkan, dan dapatkan nilai ekonomis dari limbah rumah tangga Anda.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/cara-daftar"
                  className="inline-flex items-center gap-2 bg-white text-[#2F855A] font-semibold px-6 py-3 rounded-full hover:bg-green-50 transition-colors shadow-lg"
                >
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/edukasi"
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/30 transition-colors border border-white/30"
                >
                  Tips Pengelolaan Sampah <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="flex items-center justify-center mt-4 lg:mt-0">
              <div className="relative w-xl lg:w-160">
                {/* <div className="absolute inset-0 rounded-full border border-white/15 bg-white/5" />
                <div className="absolute inset-6 rounded-full border border-white/10 bg-white/5" />

                <div className="absolute inset-14 rounded-full bg-white/15 border border-white/25 flex flex-col items-center justify-center text-center shadow-inner">
                  <div className="text-4xl mb-1">♻️</div>
                  <div className="text-sm font-bold leading-tight">TPS RTH</div>
                  <div className="text-[11px] text-green-200 mt-0.5">Cikaret, Bogor</div>
                </div>

                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/25 rounded-xl px-3 py-2 border border-white/30 text-center shadow-lg backdrop-blur-sm whitespace-nowrap">
                  <div className="font-bold text-sm">1.247+ Nasabah</div>
                  <div className="text-[10px] text-green-200">Aktif terdaftar</div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-6 bg-white/25 rounded-xl px-3 py-2 border border-white/30 text-center shadow-lg backdrop-blur-sm">
                  <div className="font-bold text-sm">8,5 ton</div>
                  <div className="text-[10px] text-green-200">Per bulan</div>
                </div>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/25 rounded-xl px-3 py-2 border border-white/30 text-center shadow-lg backdrop-blur-sm whitespace-nowrap">
                  <div className="font-bold text-sm">Reduce · Reuse · Recycle</div>
                  <div className="text-[10px] text-green-200">Prinsip 3R</div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -left-6 bg-white/25 rounded-xl px-3 py-2 border border-white/30 text-center shadow-lg backdrop-blur-sm">
                  <div className="font-bold text-sm">5 Mitra</div>
                  <div className="text-[10px] text-green-200">Bank Sampah</div>
                </div>

                <div className="absolute top-14 right-5 w-2 h-2 rounded-full bg-white/40" />
                <div className="absolute bottom-14 left-5 w-2 h-2 rounded-full bg-white/40" />
                <div className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-white/25" />
                <div className="absolute bottom-6 left-16 w-1.5 h-1.5 rounded-full bg-white/25" /> */}
                <div className="aspect-16/11 rounded-2xl bg-[#092928] shadow-lg md:aspect-square md:flex-1 2xl:aspect-16/11">
                  <img
                    src="/webp/tps.webp"
                    alt="Main Building"
                    className="object-fit h-full w-full rounded-2xl shadow-xl"
                  />
                </div>
                <div className="absolute top-3 -translate-y-1/2 -right-6 bg-white/25 shadow-md rounded-xl ps-10 pe-3 py-2 border border-white/30 shadow-lg backdrop-blur-sm">
                  <div className="font-bold text-md">TPST-3R RTH PBPA</div>
                  <div className="text-sm text-green-200">Paguyuban Bumi Puspiptek Asri</div>
                </div>
                <div className="absolute -top-2 right-48 text-3xl rounded-full select-none">📍</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`${s.bg} shadow-sm rounded-2xl p-5 flex items-center gap-4`}>
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="py-16 bg-[#FBFAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">
                Tentang Kami
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4 leading-tight">
                Solusi Cerdas Pengelolaan Sampah untuk Kota Bogor
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {tpsInfo.mission}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Berlokasi di {tpsInfo.district}, {tpsInfo.city}, kami melayani warga sekitar dalam mengelola
                sampah rumah tangga melalui sistem pemilahan, pengomposan, dan penyetoran ke bank sampah mitra.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {tpsInfo.wasteTypes.map((w) => (
                  <span key={w} className="text-xs bg-[#F0FFF4] text-[#2F855A] border border-green-200 rounded-full px-3 py-1 font-medium">
                    {w}
                  </span>
                ))}
              </div>
              <Link
                href="/tentang"
                className="inline-flex items-center gap-2 text-[#2F855A] font-semibold hover:text-[#276749] transition-colors"
              >
                Pelajari lebih lanjut <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: "♻️", title: "Reduce", desc: "Kurangi produksi sampah dari sumbernya" },
                { emoji: "🔄", title: "Reuse", desc: "Manfaatkan kembali barang yang masih layak" },
                { emoji: "🌱", title: "Recycle", desc: "Daur ulang sampah menjadi produk baru" },
                { emoji: "💰", title: "Nilai Ekonomis", desc: "Sampah terpilah menghasilkan pendapatan" },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">
                Terbaru
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Berita & Pengumuman</h2>
            </div>
            <Link
              href="/berita"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#2F855A] hover:text-[#276749] transition-colors"
            >
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <Link
              href="/berita"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F855A] hover:text-[#276749]"
            >
              Lihat semua berita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2F855A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-3xl font-bold mb-4">Bergabunglah Bersama Kami</h2>
          <p className="text-green-100 leading-relaxed mb-8 max-w-xl mx-auto">
            Jadilah bagian dari gerakan pengelolaan sampah yang berkelanjutan. Daftarkan diri Anda
            sebagai nasabah dan mulai berkontribusi untuk lingkungan yang lebih bersih.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/cara-daftar"
              className="inline-flex items-center gap-2 bg-white text-[#2F855A] font-semibold px-7 py-3 rounded-full hover:bg-green-50 transition-colors shadow-lg"
            >
              Cara Mendaftar <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/30 transition-colors border border-white/30"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
