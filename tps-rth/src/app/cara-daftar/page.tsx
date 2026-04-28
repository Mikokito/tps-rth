"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, FileText, MessageSquare } from "lucide-react";
import { tpsInfo } from "@/data/tps";

interface Step {
  num: string;
  title: string;
  desc: string;
  emoji: string;
  disclaimer?: string;
  cta?: { label: string; url: string };
}

const steps: Step[] = [
  {
    num: "01",
    title: "Pelajari Informasi TPS",
    desc: "Baca tentang layanan, jam operasional, dan jenis sampah yang diterima oleh TPS RTH Cikaret untuk memastikan sesuai dengan kebutuhan Anda.",
    emoji: "📖",
  },
  {
    num: "02",
    title: "Isi Formulir Pendaftaran",
    desc: "Lengkapi formulir pendaftaran online (Google Form) dengan data diri yang valid. Pastikan nomor HP aktif karena akan dihubungi oleh admin.",
    emoji: "📝",
    disclaimer: "📌 Catatan: Alternatif: Datang langsung ke Jl. Duren Sawit Raya No. 12 pada jam operasional.",
    cta: { label: "Isi Formulir Pendaftaran", url: tpsInfo.gformUrl },
  },
  {
    num: "03",
    title: "Verifikasi oleh Admin",
    desc: "Admin TPS RTH akan menghubungi Anda melalui WhatsApp untuk konfirmasi data dan penjelasan lebih lanjut tentang sistem bank sampah.",
    emoji: "✅",
  },
  {
    num: "04",
    title: "Kunjungi TPS RTH",
    desc: "Datang ke TPS RTH Cikaret pada jam operasional untuk pengenalan fasilitas, mendapatkan buku tabungan nasabah, dan menyetorkan sampah pertama Anda.",
    emoji: "🏪",
  },
  {
    num: "05",
    title: "Mulai Menabung Sampah",
    desc: "Pilah sampah di rumah secara rutin, setor sesuai jadwal atau sewaktu-waktu, dan pantau saldo tabungan sampah Anda.",
    emoji: "💰",
  },
];

const faqs = [
  {
    q: "Apakah ada biaya pendaftaran?",
    a: "Pendaftaran sebagai nasabah TPS RTH sepenuhnya GRATIS. Tidak ada biaya apapun yang dikenakan.",
  },
  {
    q: "Sampah apa saja yang bisa disetor?",
    a: "Kami menerima sampah organik (daun, sisa makanan), anorganik (plastik, kertas, kardus, kaleng, kaca, logam), dan B3 rumah tangga (baterai, elektronik bekas). Sampah harus sudah dipilah dan dibersihkan.",
  },
  {
    q: "Berapa batas minimal setoran sampah?",
    a: "Tidak ada batas minimal. Anda bisa menyetorkan berapapun sampah yang sudah terpilah. Namun untuk efisiensi, disarankan minimal 2-3 kg per kunjungan.",
  },
  {
    q: "Bagaimana cara mengetahui harga sampah terkini?",
    a: "Harga sampah diperbarui setiap bulan berdasarkan harga pasar. Anda bisa memantaunya melalui papan informasi di TPS, WhatsApp grup nasabah, atau bertanya langsung ke petugas.",
  },
  {
    q: "Apakah ada layanan jemput sampah?",
    a: "Ya, kami memiliki layanan jemput sampah untuk wilayah sekitar TPS dengan ketentuan tertentu. Hubungi admin melalui WhatsApp untuk informasi lebih lanjut.",
  },
  {
    q: "Bagaimana cara menarik saldo tabungan sampah?",
    a: "Saldo tabungan sampah dapat dicairkan setiap 3 bulan sekali, atau saat saldo mencapai Rp 50.000. Pencairan dilakukan langsung di TPS RTH.",
  },
  {
    q: "Apakah bisa mendaftar untuk badan usaha/instansi?",
    a: "Tentu. Kami melayani pendaftaran untuk rumah tangga maupun badan usaha, instansi, atau komunitas. Hubungi kami untuk skema kerjasama khusus.",
  },
];

export default function CaraDaftarPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Page hero */}
      <section className="bg-[#2F855A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white">Cara Daftar</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Cara Mendaftar sebagai Nasabah</h1>
          <p className="text-green-100 max-w-xl leading-relaxed">
            Bergabunglah dengan ribuan nasabah TPS RTH Cikaret. Pendaftaran mudah, gratis, dan Anda langsung bisa mulai mengelola sampah secara produktif.
          </p>
        </div>
      </section>

      {/* Requirements — placed at top */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Sebelum Mendaftar</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Persyaratan Pendaftaran</h2>
            <p className="text-gray-500 text-sm mt-2">Pastikan Anda memenuhi seluruh persyaratan berikut sebelum mengisi formulir.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: "🪪", req: "KTP atau identitas resmi yang masih berlaku" },
              { emoji: "📱", req: "Nomor WhatsApp aktif untuk komunikasi dengan admin" },
              { emoji: "🏠", req: "Berdomisili atau berkegiatan di wilayah layanan TPS RTH" },
              { emoji: "♻️", req: "Bersedia memilah sampah sebelum disetor ke TPS" },
              { emoji: "📋", req: "Mengisi formulir pendaftaran dengan data yang valid" },
              { emoji: "✅", req: "Menyetujui tata tertib dan peraturan bank sampah" },
            ].map((item) => (
              <div key={item.req} className="flex gap-3 items-start bg-[#FBFAF2] rounded-xl p-4 border border-[#E6DFAF]">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{item.req}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-[#FBFAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">Panduan</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Langkah-Langkah Pendaftaran</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex gap-5">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#2F855A] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {s.num}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-green-200 mt-2 min-h-6" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6 flex-1">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>

                        {/* Disclaimer for step 02 */}
                        {s.disclaimer && (
                          <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                            {s.disclaimer}
                          </p>
                        )}

                        {/* CTA button for step 02 */}
                        {s.cta && (
                          <a
                            href={s.cta.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 bg-[#2F855A] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#276749] transition-colors shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            {s.cta.label}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#2F855A] uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Pertanyaan yang Sering Diajukan</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#FBFAF2] rounded-2xl border border-[#E6DFAF] overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#2F855A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 bg-[#2F855A] rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-bold text-lg mb-2">Masih ada pertanyaan?</h3>
            <p className="text-green-100 text-sm mb-4">
              Tim kami siap menjawab pertanyaan Anda melalui WhatsApp pada jam operasional.
            </p>
            <a
              href={`https://wa.me/${tpsInfo.contact.whatsapp}?text=${encodeURIComponent("Halo, saya ingin bertanya tentang TPS RTH Cikaret.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#2F855A] font-semibold px-6 py-3 rounded-full hover:bg-green-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Chat WhatsApp Sekarang
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}