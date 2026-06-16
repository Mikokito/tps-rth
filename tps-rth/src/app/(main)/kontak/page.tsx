"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, MessageSquare, Send, CheckCircle, Loader2, User, Tag, Home } from "lucide-react";
import { tpsInfo } from "@/data/tps";
import { createClient } from "@/utils/supabase/client";

const subjectOptions = ["Layanan", "Keluhan", "Kerjasama", "Pendaftaran", "Lainnya"];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#E6DFAF] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] focus:border-transparent transition-shadow bg-white";

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

export default function KontakPage() {
  const [form, setForm] = useState({ nama: "", email: "", whatsapp: "", subjek: "", pesan: "" });
  const [sent, setSent]               = useState(false);
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState("");
  const [formVisible, setFormVisible] = useState(true);
  const [successVisible, setSuccessVisible] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);

    const supabase = createClient();
    const { error: dbErr } = await supabase.from("pesan").insert({
      nama:     form.nama,
      email:    form.email,
      whatsapp: form.whatsapp || null,
      subjek:   form.subjek,
      pesan:    form.pesan,
    });

    setSending(false);

    if (dbErr) {
      setError("Gagal mengirim pesan. Silakan coba lagi.");
      return;
    }

    setFormVisible(false);
    setTimeout(() => {
      setSent(true);
      setTimeout(() => setSuccessVisible(true), 30);
    }, 300);
  }

  function handleSendAnother() {
    setSuccessVisible(false);
    setTimeout(() => {
      setSent(false);
      setForm({ nama: "", email: "", whatsapp: "", subjek: "", pesan: "" });
      setTimeout(() => setFormVisible(true), 30);
    }, 300);
  }

  return (
    <>
      {/* Page hero */}
      <section className="px-4 bg-[#2F855A] text-white py-14">
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
      <section className="px-4 py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center shrink-0">
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
                    <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center shrink-0">
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
                    <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center shrink-0">
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
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
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

              {/* Location map (OpenStreetMap embed) */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lokasi</h3>
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <iframe
                    title="Peta Lokasi TPS RTH Cikaret"
                    width="100%"
                    height="220"
                    className="border-0"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${tpsInfo.coordinates.lon - 0.005}%2C${tpsInfo.coordinates.lat - 0.005}%2C${tpsInfo.coordinates.lon + 0.005}%2C${tpsInfo.coordinates.lat + 0.005}&layer=mapnik&marker=${tpsInfo.coordinates.lat}%2C${tpsInfo.coordinates.lon}`}
                  />
                  <div className="bg-white px-4 py-2.5 text-center">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${tpsInfo.coordinates.lat}&mlon=${tpsInfo.coordinates.lon}#map=17/${tpsInfo.coordinates.lat}/${tpsInfo.coordinates.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#2F855A] hover:underline font-semibold"
                    >
                      Buka di OpenStreetMap →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kirim Pesan</h2>
              <p className="text-sm text-gray-500 mb-6">
                Kolom bertanda <span className="text-red-500 font-semibold">*</span> wajib diisi.
              </p>

              <div className="bg-[#FBFAF2] shadow-sm rounded-2xl p-6 border border-[#E6DFAF] overflow-hidden">
                {sent ? (
                  <div
                    className={`relative text-center rounded-2xl border border-green-200 bg-gradient-to-br from-[#F0FFF4] via-white to-[#F0FFF4] px-6 py-10 transition-all duration-500 ease-out ${
                      successVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"
                    }`}
                  >
                    <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-green-100" />
                      <span className="absolute inset-1.5 rounded-full bg-green-200/60" />
                      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#2F855A] shadow-lg shadow-green-200">
                        <CheckCircle className="h-8 w-8 text-white" strokeWidth={2.25} />
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-xl mb-2">Pesan Terkirim!</h3>
                    <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
                      Terima kasih, pesan Anda telah kami terima. Tim kami akan segera merespons.
                    </p>

                    {(form.nama || form.subjek) && (
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {form.nama && (
                          <span className="inline-flex items-center gap-1.5 bg-white border border-green-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                            <User className="w-3 h-3 text-[#2F855A]" /> {form.nama}
                          </span>
                        )}
                        {form.subjek && (
                          <span className="inline-flex items-center gap-1.5 bg-white border border-green-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                            <Tag className="w-3 h-3 text-[#2F855A]" /> {form.subjek}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleSendAnother}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#276749] transition-colors shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Kirim Pesan Lain
                      </button>
                      <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#2F855A] px-5 py-2.5 rounded-xl border border-gray-200 hover:border-[#2F855A]/40 transition-colors"
                      >
                        <Home className="w-3.5 h-3.5" /> Kembali ke Beranda
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className={`space-y-5 transition-all duration-300 ease-in ${
                      formVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nama Lengkap <RequiredMark />
                      </label>
                      <input
                        id="nama"
                        type="text"
                        required
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        placeholder="Masukkan nama lengkap Anda"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Alamat Email <RequiredMark />
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@contoh.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nomor WhatsApp
                        <span className="text-gray-400 font-normal ml-1">(opsional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                          +62
                        </span>
                        <input
                          id="whatsapp"
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                          placeholder="812-3456-7890"
                          className={`${inputClass} pl-12`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subjek" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Subjek <RequiredMark />
                      </label>
                      <select
                        id="subjek"
                        required
                        value={form.subjek}
                        onChange={(e) => setForm({ ...form, subjek: e.target.value })}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" disabled>Pilih subjek pesan Anda</option>
                        {subjectOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="pesan" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Pesan <RequiredMark />
                      </label>
                      <textarea
                        id="pesan"
                        required
                        rows={5}
                        value={form.pesan}
                        onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                        placeholder="Tulis pertanyaan atau pesan Anda di sini..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Kirim Pesan</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
