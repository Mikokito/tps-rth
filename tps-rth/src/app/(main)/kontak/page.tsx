"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
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
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");

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

    setSent(true);
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kirim Pesan</h2>
              <p className="text-sm text-gray-500 mb-6">
                Kolom bertanda <span className="text-red-500 font-semibold">*</span> wajib diisi.
              </p>

              <div className="bg-[#FBFAF2] shadow-sm rounded-2xl p-6 border border-[#E6DFAF]">
                {sent ? (
                  <div className="bg-[#F0FFF4] border border-green-200 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-[#2F855A] mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Pesan Terkirim!</h3>
                    <p className="text-gray-600 text-sm">
                      Terima kasih, pesan Anda telah kami terima. Kami akan segera merespons.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSent(false); setForm({ nama: "", email: "", whatsapp: "", subjek: "", pesan: "" }); }}
                      className="mt-4 text-sm text-[#2F855A] font-semibold hover:underline"
                    >
                      Kirim pesan lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
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
