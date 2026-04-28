import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Edukasi",
  description: "Artikel edukasi pengelolaan sampah, tips pemilahan organik dan anorganik, serta panduan daur ulang.",
};

const organikItems = [
  "Sisa makanan dan sayuran",
  "Kulit buah dan buah busuk",
  "Daun-daun kering",
  "Ampas kopi dan teh",
  "Kotoran hewan peliharaan",
  "Ranting dan rumput",
];

const anorganikItems = [
  "Botol & wadah plastik (kode 1–7)",
  "Kertas, koran, kardus",
  "Kaleng aluminium & logam",
  "Botol kaca",
  "Elektronik bekas (e-waste)",
  "Baterai dan lampu bekas (B3)",
];

const recycleSteps = [
  { step: "1", title: "Pilah dari Rumah", desc: "Pisahkan sampah organik, anorganik, dan B3 menggunakan tempat sampah berbeda.", emoji: "🏠" },
  { step: "2", title: "Bersihkan Sampah", desc: "Bilas botol, kaleng, dan wadah plastik sebelum disetor agar tidak berbau.", emoji: "🚿" },
  { step: "3", title: "Setor ke TPS RTH", desc: "Bawa sampah terpilah ke TPS RTH sesuai jadwal atau timbang di lokasi.", emoji: "🏪" },
  { step: "4", title: "Dicatat & Ditimbang", desc: "Petugas akan menimbang dan mencatat di buku tabungan nasabah Anda.", emoji: "⚖️" },
  { step: "5", title: "Proses Daur Ulang", desc: "Sampah dikirim ke pabrik daur ulang atau diolah langsung di TPS.", emoji: "♻️" },
  { step: "6", title: "Nilai Ekonomis", desc: "Sampah organik menjadi kompos, anorganik menghasilkan rupiah untuk nasabah.", emoji: "💰" },
];

const facts = [
  { value: "64 juta ton", label: "sampah dihasilkan Indonesia per tahun" },
  { value: "24%", label: "sampah tidak terkelola dengan baik" },
  { value: "500 tahun", label: "waktu plastik terurai di alam" },
  { value: "3,5 juta", label: "ton sampah plastik masuk ke laut tiap tahun" },
];

export default function EdukasiPage() {
  return (
    <>
      {/* Page hero */}
      <section className="bg-[#2F855A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white">Edukasi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Edukasi Pengelolaan Sampah</h1>
          <p className="text-green-100 max-w-xl leading-relaxed">
            Pelajari pentingnya mengelola sampah, cara memilah yang benar, dan langkah-langkah daur ulang yang bisa Anda mulai hari ini.
          </p>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Mengapa Penting?</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-5 leading-tight">
                Pengelolaan Sampah yang Baik Dimulai dari Rumah
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Setiap harinya, satu rumah tangga rata-rata menghasilkan 0,5–1 kg sampah. Tanpa pengelolaan
                  yang tepat, sampah menumpuk di TPA, mencemari tanah dan air, serta melepaskan gas metana
                  yang memperparah perubahan iklim.
                </p>
                <p>
                  Dengan memilah sampah dari rumah, Anda membantu mengurangi beban TPA hingga <strong className="text-[#2F855A]">60%</strong>.
                  Sampah organik bisa menjadi kompos penyubur tanaman, sementara anorganik bisa didaur ulang
                  menjadi bahan baku produk baru.
                </p>
                <p>
                  Lebih dari itu, pengelolaan sampah yang baik menciptakan nilai ekonomis — sampah yang Anda
                  setorkan ke bank sampah bisa menghasilkan <strong className="text-[#2F855A]">pendapatan tambahan</strong> untuk keluarga Anda.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facts.map((f) => (
                <div key={f.label} className="bg-red-50 rounded-2xl p-5 text-center">
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600 mb-1">{f.value}</div>
                  <div className="text-xs text-gray-600 leading-snug">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sorting guide */}
      <section className="py-14 bg-[#FBFAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Panduan Pemilahan</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Cara Memilah Sampah yang Benar</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Organik */}
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm">
              <div className="bg-[#2F855A] px-6 py-4">
                <div className="text-3xl mb-1">🟢</div>
                <h3 className="text-xl font-bold text-white">Sampah Organik</h3>
                <p className="text-green-200 text-sm mt-1">Dapat dikompos, biodegradable</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {organikItems.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-[#2F855A] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 p-3 bg-[#F0FFF4] rounded-xl">
                  <p className="text-xs text-[#2F855A] font-medium">
                    💡 Simpan dalam wadah tertutup. Olah menjadi kompos atau setor ke TPS untuk diproses.
                  </p>
                </div>
              </div>
            </div>

            {/* Anorganik */}
            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
              <div className="bg-blue-600 px-6 py-4">
                <div className="text-3xl mb-1">🔵</div>
                <h3 className="text-xl font-bold text-white">Sampah Anorganik</h3>
                <p className="text-blue-200 text-sm mt-1">Dapat didaur ulang, non-biodegradable</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {anorganikItems.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium">
                    💡 Bersihkan dan keringkan sebelum disetor. Pisahkan B3 (baterai, elektronik) dari sampah biasa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recycle infographic */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Alur Daur Ulang</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Dari Sampah Menjadi Manfaat</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Ikuti 6 langkah mudah ini untuk berkontribusi pada pengelolaan sampah yang bertanggung jawab.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recycleSteps.map((s, idx) => (
              <div key={s.step} className="relative bg-[#FBFAF2] rounded-2xl p-6 border border-[#E6DFAF]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#2F855A] text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                {idx < recycleSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-gray-300 text-xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick tips */}
      <section className="py-14 bg-[#F0FFF4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Tips Cepat Pengelolaan Sampah</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: "🛍️", tip: "Gunakan tas belanja reusable untuk mengurangi sampah plastik." },
              { emoji: "🚿", tip: "Cuci botol dan kaleng sebelum dibuang agar tidak mengotori sampah lain." },
              { emoji: "📦", tip: "Lipat dan padatkan kardus agar tidak memakan tempat di tempat sampah." },
              { emoji: "🥕", tip: "Buat kompos dari sisa sayur dan buah untuk pupuk tanaman rumah." },
              { emoji: "💡", tip: "Pisahkan baterai bekas ke tempat khusus B3, jangan buang sembarangan." },
              { emoji: "📱", tip: "Donasikan gadget lama yang masih berfungsi daripada langsung dibuang." },
            ].map((t) => (
              <div key={t.tip} className="flex gap-3 bg-white shadow-sm rounded-xl p-4 border border-green-100">
                <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
