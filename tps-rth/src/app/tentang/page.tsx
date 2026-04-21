import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, CheckCircle, ArrowRight, Users, Weight, Building2, Recycle } from "lucide-react";
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

      {/* TPS Info card */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil TPS</h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { label: "Nama TPS", value: tpsInfo.name },
                    { label: "Status", value: tpsInfo.status },
                    { label: "Alamat", value: tpsInfo.address },
                    { label: "Kapasitas", value: tpsInfo.capacity },
                    { label: "Kecamatan", value: tpsInfo.district },
                    { label: "Berdiri Sejak", value: tpsInfo.established },
                    { label: "Kota", value: `${tpsInfo.city}, ${tpsInfo.province}` },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</dt>
                      <dd className="mt-1 text-gray-900 font-medium">{item.value}</dd>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Jenis Sampah Diterima</dt>
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

            {/* Contact quick */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontak Cepat</h2>
              <div className="bg-[#2F855A] rounded-2xl p-6 text-white space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-200 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-green-200 font-medium mb-0.5">Alamat</div>
                    <div className="text-sm">{tpsInfo.address}, {tpsInfo.district}, {tpsInfo.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-200 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-green-200 font-medium mb-0.5">Telepon</div>
                    <div className="text-sm">{tpsInfo.contact.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-200 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-green-200 font-medium mb-0.5">Email</div>
                    <div className="text-sm">{tpsInfo.contact.email}</div>
                  </div>
                </div>
                <div className="border-t border-green-400 pt-4 mt-4">
                  <div className="text-xs text-green-200 font-medium mb-2">Jam Operasional</div>
                  {tpsInfo.operationalHours.map((h) => (
                    <div key={h.day} className="flex justify-between text-sm py-0.5">
                      <span className="text-green-100">{h.day}</span>
                      <span className="font-medium">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Misi Kami</h3>
              <p className="text-gray-600 leading-relaxed">{tpsInfo.mission}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visi Kami</h3>
              <p className="text-gray-600 leading-relaxed">{tpsInfo.vision}</p>
            </div>
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
      <section className="py-14 bg-gray-50">
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
