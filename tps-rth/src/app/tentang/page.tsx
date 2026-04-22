import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Users, Weight, Building2, Recycle } from "lucide-react";
import { tpsInfo } from "@/data/tps";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Informasi lengkap mengenai TPS RTH Cikaret, misi, visi, fasilitas, dan struktur organisasi.",
};

const dataStats = [
  { label: "Nasabah Aktif", value: tpsInfo.stats.nasabah.toLocaleString("id-ID") + "+", icon: Users, color: "text-[#2F855A]", bg: "bg-[#F0FFF4]" },
  { label: "Sampah/Bulan", value: tpsInfo.stats.sampahBulanan + " ton", icon: Weight, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Mitra", value: tpsInfo.stats.mitraBankSampah + " mitra", icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Daur Ulang", value: tpsInfo.stats.totalDaur + " ton", icon: Recycle, color: "text-purple-600", bg: "bg-purple-50" },
];

const threeR = [
  {
    key: "Reduce",
    label: "Reduce",
    sublabel: "Mengurangi",
    emoji: "🔻",
    color: "bg-red-50 border-red-100",
    headColor: "text-red-600",
    desc: "Langkah pertama dan paling efektif: kurangi produksi sampah dari sumbernya sebelum sampah terbentuk.",
    tips: [
      "Gunakan tas belanja kain yang dapat dipakai ulang",
      "Pilih produk dengan kemasan minimal atau tanpa kemasan",
      "Hindari penggunaan plastik sekali pakai",
      "Beli produk isi ulang (refill) daripada membeli baru",
    ],
  },
  {
    key: "Reuse",
    label: "Reuse",
    sublabel: "Menggunakan Kembali",
    emoji: "🔄",
    color: "bg-blue-50 border-blue-100",
    headColor: "text-blue-600",
    desc: "Manfaatkan kembali barang yang masih bisa dipakai sebelum memutuskan untuk membuangnya.",
    tips: [
      "Pakai botol minum pribadi sebagai pengganti botol sekali pakai",
      "Repurpose wadah bekas menjadi pot tanaman atau organizer",
      "Donasikan pakaian dan perabot yang sudah tidak terpakai",
      "Perbaiki barang yang rusak sebelum membelinya yang baru",
    ],
  },
  {
    key: "Recycle",
    label: "Recycle",
    sublabel: "Mendaur Ulang",
    emoji: "♻️",
    color: "bg-[#F0FFF4] border-green-100",
    headColor: "text-[#2F855A]",
    desc: "Proses sampah menjadi bahan baku produk baru yang bernilai ekonomis dan ramah lingkungan.",
    tips: [
      "Pilah sampah organik dan anorganik dari sumbernya",
      "Setor sampah anorganik ke TPS RTH untuk didaur ulang",
      "Olah sampah organik menjadi kompos untuk pupuk tanaman",
      "Buat kerajinan kreatif dari barang-barang bekas daur ulang",
    ],
  },
];

export default function TentangPage() {
  return (
    <>
      {/* Page hero */}
      <section className="bg-[#2F855A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white">Tentang Kami</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Tentang TPS RTH Cikaret</h1>
          <p className="text-green-100 max-w-xl leading-relaxed">
            Mengenal lebih dekat Tempat Pengelolaan Sampah Ruang Terbuka Hijau yang melayani masyarakat Kota Bogor.
          </p>
        </div>
      </section>

      {/* Profile section */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Description */}
            <div>
              <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Profil Kami</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-4">
                Siapa TPS RTH Cikaret?
              </h2>
              <div className="h-30 rounded-2xl bg-[#092928] mb-4 md:h-30 2xl:h-30">
                <img
                  src="/webp/tps.webp"
                  alt="Main Building"
                  className="object-cover h-full w-full rounded-2xl shadow-xl"
                />
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">TPS RTH Cikaret</strong> adalah Tempat Pengelolaan Sampah
                  berbasis Ruang Terbuka Hijau yang hadir sebagai solusi pengelolaan sampah terpadu di
                  Kelurahan Cikaret, Kota Bogor. Berdiri sejak tahun {tpsInfo.established}, kami
                  berkomitmen mewujudkan lingkungan yang bersih dan sehat melalui pendekatan komunitas.
                </p>
                <p>
                  Kami mengelola sampah rumah tangga warga melalui sistem <strong className="text-[#2F855A]">bank
                  sampah</strong> — warga dapat menabung sampah terpilah dan mendapatkan nilai ekonomis dari
                  limbah yang selama ini dianggap tidak berguna. Setiap setoran dicatat dan dikonversi menjadi
                  saldo yang dapat dicairkan secara berkala.
                </p>
                <p>
                  Selain pengelolaan fisik sampah, TPS RTH aktif dalam kegiatan edukasi, sosialisasi pemilahan
                  sampah, dan pemberdayaan warga sekitar. Kami percaya bahwa perubahan dimulai dari
                  kesadaran komunitas.
                </p>
              </div>
            </div>

            {/* Info table */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Informasi TPS</h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-0">
                {[
                  { label: "Nama TPS", value: tpsInfo.name },
                  { label: "Status", value: tpsInfo.status },
                  { label: "Berdiri Sejak", value: tpsInfo.established },
                  { label: "Kapasitas", value: tpsInfo.capacity },
                  { label: "Alamat", value: tpsInfo.address },
                  { label: "Kecamatan", value: tpsInfo.district },
                  { label: "Kota", value: `${tpsInfo.city}, ${tpsInfo.province}` },
                ].map((item, idx, arr) => (
                  <div
                    key={item.label}
                    className={`flex justify-between items-start py-3 gap-4 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <dt className="text-sm text-gray-500 flex-shrink-0 w-32">{item.label}</dt>
                    <dd className="text-sm font-medium text-gray-900 text-right">{item.value}</dd>
                  </div>
                ))}
                <div className="pt-3">
                  <dt className="text-sm text-gray-500 mb-2">Jenis Sampah Diterima</dt>
                  <dd className="flex flex-wrap gap-2">
                    {tpsInfo.wasteTypes.map((w) => (
                      <span key={w} className="text-xs bg-[#F0FFF4] text-[#2F855A] border border-green-200 rounded-full px-3 py-1 font-medium">
                        {w}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3R Section */}
      <section className="py-14 bg-[#FBFAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Prinsip Kami</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Konsep 3R yang Kami Terapkan</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm leading-relaxed">
              Seluruh kegiatan TPS RTH Cikaret berlandaskan pada tiga prinsip dasar pengelolaan sampah
              yang berkelanjutan: Reduce, Reuse, dan Recycle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {threeR.map((r) => (
              <div key={r.key} className={`bg-white rounded-2xl border ${r.color} overflow-hidden shadow-sm`}>
                <div className={`px-6 py-5 border-b ${r.color}`}>
                  <div className="text-4xl mb-2">{r.emoji}</div>
                  <h3 className={`text-2xl font-extrabold ${r.headColor}`}>{r.label}</h3>
                  <p className="text-gray-500 text-sm font-medium">{r.sublabel}</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{r.desc}</p>
                  <ul className="space-y-2">
                    {r.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${r.headColor}`} />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data stats */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Data TPS</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Pencapaian Kami</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dataStats.map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-6 text-center`}>
                <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
                <div className="text-sm text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="py-14 bg-[#FBFAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Pengurus</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Struktur Organisasi</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {tpsInfo.organization.map((member) => (
              <div key={member.role} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 bg-[#F0FFF4] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{member.name}</div>
                  <div className="text-xs text-[#2F855A] font-medium mt-0.5">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Sarana</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Fasilitas TPS</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tpsInfo.facilities.map((f) => (
              <div key={f.name} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[#2F855A] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">{f.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#2F855A]">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Tertarik Bergabung?</h2>
          <p className="text-green-100 mb-6">Daftarkan diri Anda sebagai nasabah TPS RTH dan mulai berkontribusi untuk lingkungan yang lebih baik.</p>
          <Link
            href="/cara-daftar"
            className="inline-flex items-center gap-2 bg-white text-[#2F855A] font-semibold px-7 py-3 rounded-full hover:bg-green-50 transition-colors shadow-lg"
          >
            Cara Mendaftar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}