"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
import { tpsInfo } from "@/data/tps";

const devTeam = [
  { name: "Lieshia Metrulana", role: "Project Lead & Developer", email: "lieshia@example.com" },
  { name: "Tim TPS RTH", role: "Pengelola TPS", email: tpsInfo.contact.email },
];

export default function KontakPage() {
  const [form, setForm] = useState({ nama: "", email: "", pesan: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Pesan dari ${form.nama} - TPS RTH Website`);
    const body = encodeURIComponent(`Nama: ${form.nama}\nEmail: ${form.email}\n\nPesan:\n${form.pesan}`);
    window.location.href = `mailto:${tpsInfo.contact.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      {/* Page hero */}
      <section className="bg-[#2F855A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white">Kontak</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Hubungi Kami</h1>
          <p className="text-green-100 max-w-xl leading-relaxed">
            Ada pertanyaan, saran, atau ingin mengetahui lebih lanjut tentang TPS RTH Cikaret? Kami siap membantu Anda.
          </p>
        </div>
      </section>

      {/* Contact info + form */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#2F855A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Alamat</div>
                      <div className="text-gray-600 text-sm mt-0.5 leading-relaxed">
                        {tpsInfo.address}, {tpsInfo.district}<br />
                        {tpsInfo.city}, {tpsInfo.province} {tpsInfo.postalCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#2F855A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Telepon</div>
                      <a href={`tel:${tpsInfo.contact.phone}`} className="text-[#2F855A] text-sm hover:underline mt-0.5 block">
                        {tpsInfo.contact.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#2F855A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <a href={`mailto:${tpsInfo.contact.email}`} className="text-[#2F855A] text-sm hover:underline mt-0.5 block">
                        {tpsInfo.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">WhatsApp</div>
                      <a
                        href={`https://wa.me/${tpsInfo.contact.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 text-sm hover:underline mt-0.5 block"
                      >
                        Chat via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#2F855A]" /> Jam Operasional
                </h3>
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  {tpsInfo.operationalHours.map((h, idx) => (
                    <div
                      key={h.day}
                      className={`flex justify-between px-5 py-3 text-sm ${
                        idx < tpsInfo.operationalHours.length - 1 ? "border-b border-gray-100" : ""
                      } ${h.hours === "Tutup" ? "text-red-500" : "text-gray-700"}`}
                    >
                      <span className="font-medium">{h.day}</span>
                      <span>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location map placeholder */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lokasi</h3>
                <div className="bg-gray-100 rounded-2xl h-48 flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                  <MapPin className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">Peta Lokasi TPS RTH Cikaret</p>
                  <a
                    href="https://maps.google.com/?q=Cikaret,Bogor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-[#2F855A] hover:underline font-semibold"
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
              {sent ? (
                <div className="bg-[#F0FFF4] border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-[#2F855A] mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Pesan Terkirim!</h3>
                  <p className="text-gray-600 text-sm">
                    Klien email Anda dibuka. Kami akan segera merespons pesan Anda.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 text-sm text-[#2F855A] font-semibold hover:underline"
                  >
                    Kirim pesan lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      id="nama"
                      type="text"
                      required
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Alamat Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@contoh.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="pesan" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Pesan
                    </label>
                    <textarea
                      id="pesan"
                      required
                      rows={5}
                      value={form.pesan}
                      onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                      placeholder="Tulis pertanyaan atau pesan Anda di sini..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent transition-shadow resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Kirim Pesan
                  </button>
                </form>
              )}

              {/* Dev team */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Tim Pengembang</h3>
                <div className="space-y-3">
                  {devTeam.map((m) => (
                    <div key={m.name} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-9 h-9 bg-[#F0FFF4] rounded-full flex items-center justify-center text-lg flex-shrink-0">
                        👤
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
