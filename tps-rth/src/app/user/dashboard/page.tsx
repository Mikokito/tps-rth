"use client";

import { useEffect, useRef, useState } from "react";
import {
  User, MapPin, Phone, Home, CheckCircle, XCircle, Clock,
  Banknote, Upload, FileImage, Send, X, Loader2,
} from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type NasabahRow = {
  id: string;
  rw: string | null; rt: string | null;
  alamat: string | null; hp: string | null;
  status_aktif: boolean; bergabung_tanggal: string | null;
};

type IuranRecord = {
  id: string;
  bulan: number;
  tahun: number;
  status: "belum" | "menunggu" | "sudah" | "diverifikasi" | "ditolak";
};

const BULAN_LABEL = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const STATUS_STYLE: Record<IuranRecord["status"], string> = {
  belum:       "bg-gray-100 text-gray-500",
  menunggu:    "bg-amber-50 text-amber-600",
  sudah:       "bg-green-100 text-green-700",
  diverifikasi:"bg-green-100 text-green-700",
  ditolak:     "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<IuranRecord["status"], string> = {
  belum: "Belum", menunggu: "Menunggu", sudah: "Sudah",
  diverifikasi: "Diverifikasi", ditolak: "Ditolak",
};

export default function UserDashboardPage() {
  const now = new Date();
  const TAHUN_OPTIONS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const fileRef = useRef<HTMLInputElement>(null);

  const [session,   setSession]   = useState<SessionUser | null>(null);
  const [nasabah,   setNasabah]   = useState<NasabahRow | null>(null);
  const [nasabahId, setNasabahId] = useState<string | null>(null);
  const [iuranList, setIuranList] = useState<IuranRecord[]>([]);
  const [harga,     setHarga]     = useState(50000);
  const [loading,   setLoading]   = useState(true);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [bulanIdx,  setBulanIdx]  = useState(now.getMonth());
  const [tahun,     setTahun]     = useState(now.getFullYear());
  const [foto,      setFoto]      = useState<{ nama: string; dataUrl: string } | null>(null);
  const [fotoErr,   setFotoErr]   = useState("");
  const [formErr,   setFormErr]   = useState("");
  const [sending,   setSending]   = useState(false);
  const [submitOk,  setSubmitOk]  = useState(false);

  useEffect(() => {
    async function init() {
      const s = await getSession();
      setSession(s);
      if (!s) { setLoading(false); return; }

      const supabase = createClient();

      // Nasabah now has RLS: user_id = auth.uid() — works directly with Supabase Auth
      const { data: nasabahRow } = await supabase
        .from("nasabah")
        .select("id, rw, rt, alamat, hp, status_aktif, bergabung_tanggal")
        .eq("user_id", s.id)
        .maybeSingle();

      const [{ data: iuranData }, { data: hargaRow }] = await Promise.all([
        nasabahRow
          ? supabase.from("iuran")
              .select("id, bulan, tahun, status")
              .eq("nasabah_id", nasabahRow.id)
              .order("tahun",  { ascending: false })
              .order("bulan",  { ascending: false })
          : Promise.resolve({ data: [] as IuranRecord[], error: null }),
        supabase.from("harga_iuran")
          .select("jumlah")
          .order("berlaku_mulai", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (nasabahRow)       { setNasabah(nasabahRow); setNasabahId(nasabahRow.id); }
      if (iuranData)         setIuranList(iuranData as IuranRecord[]);
      if (hargaRow?.jumlah)  setHarga(hargaRow.jumlah);
      setLoading(false);
    }
    init();
  }, []);

  function openModal() {
    setBulanIdx(now.getMonth());
    setTahun(now.getFullYear());
    setFoto(null); setFotoErr(""); setFormErr("");
    setSubmitOk(false);
    setShowModal(true);
  }

  function closeModal() {
    if (sending) return;
    setShowModal(false);
  }

  function compressImage(dataUrl: string, maxKB = 150): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        let lo = 0.05, hi = 0.92, best = canvas.toDataURL("image/jpeg", 0.5);
        for (let i = 0; i < 10; i++) {
          const mid = (lo + hi) / 2;
          const result = canvas.toDataURL("image/jpeg", mid);
          if ((result.length * 0.75) / 1024 <= maxKB) { best = result; lo = mid; }
          else { hi = mid; }
        }
        resolve(best);
      };
      img.src = dataUrl;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setFotoErr("Ukuran file maksimal 20 MB"); return; }
    setFotoErr("");
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      if (raw.startsWith("data:image")) {
        setFoto({ nama: file.name, dataUrl: await compressImage(raw, 150) });
      } else {
        if (file.size > 5 * 1024 * 1024) { setFotoErr("PDF maksimal 5 MB"); return; }
        setFoto({ nama: file.name, dataUrl: raw });
      }
    };
    reader.readAsDataURL(file);
  }

  function clearFoto() {
    setFoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleIuranSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!foto) { setFormErr("Foto bukti wajib diunggah"); return; }
    if (!session || !nasabahId) {
      setFormErr("Data nasabah tidak ditemukan.");
      return;
    }
    const bulanDB = bulanIdx + 1;
    if (iuranList.some((r) => r.bulan === bulanDB && r.tahun === tahun)) {
      setFormErr(`Iuran ${BULAN_LABEL[bulanIdx]} ${tahun} sudah pernah diajukan`);
      return;
    }
    setFormErr(""); setSending(true);

    const supabase = createClient();
    const { data, error } = await supabase.from("iuran").insert({
      nasabah_id:    nasabahId,
      user_nama:     session.nama,
      bulan:         bulanDB,
      tahun,
      jumlah:        harga,
      foto_nama:     foto.nama,
      foto_data_url: foto.dataUrl,
      status:        "menunggu",
      submitted_at:  new Date().toISOString(),
      harga_iuran:   harga,
    }).select("id, bulan, tahun, status").single();

    if (error) {
      setFormErr(`Gagal mengirim: ${error.message}`);
      setSending(false);
      return;
    }

    setIuranList((prev) => [
      data ?? { id: crypto.randomUUID(), bulan: bulanDB, tahun, status: "menunggu" as const },
      ...prev,
    ]);
    setSending(false);
    setSubmitOk(true);
  }

  if (!session) return null;

  const bulanIniLabel  = `${BULAN_LABEL[now.getMonth()]} ${now.getFullYear()}`;
  const bulanIni       = iuranList.find((r) => r.bulan === now.getMonth() + 1 && r.tahun === now.getFullYear());
  const tahunIni       = now.getFullYear();
  const sorted         = [...iuranList].filter((r) => r.tahun === tahunIni).sort((a, b) => b.bulan - a.bulan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Anggota</h1>
        <p className="text-sm text-gray-500">Selamat datang, {session.nama.split(" ")[0]}!</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* ── Profil ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Data Anggota</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2F855A] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {session.nama[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{session.nama}</p>
                <p className="text-xs text-gray-400 truncate">{session.email}</p>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-3 space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Home className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>RW {nasabah?.rw ?? session.rw ?? "—"} / RT {nasabah?.rt ?? session.rt ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{nasabah?.alamat ?? session.alamat ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{nasabah?.hp ?? session.hp ?? "—"}</span>
              </div>
            </div>
            {nasabah && (
              <p className="text-xs text-gray-400">
                Bergabung sejak {nasabah.bergabung_tanggal ?? "—"} ·{" "}
                <span className={nasabah.status_aktif ? "text-green-600" : "text-red-400"}>
                  {nasabah.status_aktif ? "Aktif" : "Tidak Aktif"}
                </span>
              </p>
            )}
            {!loading && !nasabah && (
              <p className="text-xs text-amber-500">Data anggota belum tersedia.</p>
            )}
          </div>
        </div>

        {/* ── Info Iuran ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Info Iuran Bulanan</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Status iuran bulan <span className="font-semibold text-gray-700">{bulanIniLabel}</span>
            </p>

            {bulanIni ? (
              (bulanIni.status === "diverifikasi" || bulanIni.status === "sudah") ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Sudah Diverifikasi</p>
                    <p className="text-xs text-green-600 mt-0.5">Pembayaran iuran bulan ini telah dikonfirmasi.</p>
                  </div>
                </div>
              ) : bulanIni.status === "menunggu" ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <Clock className="w-8 h-8 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-600">Menunggu Verifikasi</p>
                    <p className="text-xs text-amber-500 mt-0.5">Bukti sudah dikirim, menunggu konfirmasi admin.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-600">Pengajuan Ditolak</p>
                    <p className="text-xs text-red-500 mt-0.5">Bukti ditolak admin. Silakan kirim ulang.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                <div>
                  <p className="font-semibold text-red-600">Belum Bayar</p>
                  <p className="text-xs text-red-500 mt-0.5">Iuran bulan ini belum dikirimkan.</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={openModal}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#2F855A] border border-[#2F855A]/30 rounded-xl py-2.5 hover:bg-green-50 transition-colors"
            >
              <Banknote className="w-4 h-4" />
              Kirim Bukti Iuran
            </button>
          </div>
        </div>
      </div>

      {/* ── Riwayat Iuran ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-[#2F855A]" />
          <h2 className="text-sm font-semibold text-gray-800">Riwayat Iuran {tahunIni}</h2>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center">
            <Loader2 className="w-6 h-6 text-gray-300 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Banknote className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Belum ada riwayat iuran tahun {tahunIni}.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bulan</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {BULAN_LABEL[entry.bulan - 1]} {entry.tahun}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[entry.status]}`}>
                          {(entry.status === "diverifikasi" || entry.status === "sudah") && <CheckCircle className="w-3 h-3" />}
                          {entry.status === "menunggu"    && <Clock    className="w-3 h-3" />}
                          {entry.status === "ditolak"     && <XCircle  className="w-3 h-3" />}
                          {entry.status === "belum"       && <XCircle  className="w-3 h-3" />}
                          {STATUS_LABEL[entry.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Modal Kirim Iuran ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-10 bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="relative bg-linear-to-br from-[#276749] to-[#2F855A] px-6 pt-6 pb-8 text-white overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-green-200 uppercase tracking-widest mb-1">Pembayaran Iuran</p>
                  <h2 className="text-xl font-bold leading-tight">Kirim Bukti Iuran</h2>
                  <p className="text-green-200 text-sm mt-1">{session.nama.split(" ")[0]}</p>
                </div>
                <button type="button" onClick={closeModal} disabled={sending} title="Tutup"
                  className="text-white/60 hover:text-white transition-colors mt-0.5 disabled:opacity-40">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mt-5 inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5">
                <Banknote className="w-4 h-4 text-green-200" />
                <div>
                  <p className="text-[10px] text-green-200 font-medium uppercase tracking-wide leading-none mb-0.5">Nominal Iuran</p>
                  <p className="text-base font-bold leading-none">
                    Rp {harga.toLocaleString("id-ID")}
                    <span className="text-green-200 font-normal text-xs ml-1">/ bulan</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-6">
              {submitOk ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-9 h-9 text-[#2F855A]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Bukti Berhasil Dikirim!</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Iuran <span className="font-semibold text-gray-700">{BULAN_LABEL[bulanIdx]} {tahun}</span> sedang
                    menunggu verifikasi admin.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Menunggu konfirmasi admin
                  </div>
                  <button type="button" onClick={closeModal}
                    className="mt-5 w-full py-3 rounded-xl bg-[#2F855A] text-white font-semibold text-sm hover:bg-[#276749] transition-colors">
                    Selesai
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIuranSubmit} className="space-y-5">
                  {formErr && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formErr}</span>
                    </div>
                  )}

                  {/* Periode */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Periode Pembayaran</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Bulan</label>
                        <select value={bulanIdx} aria-label="Bulan"
                          onChange={(e) => { setBulanIdx(Number(e.target.value)); setFormErr(""); }}
                          className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F855A]/40 focus:border-[#2F855A] bg-gray-50 transition-colors">
                          {BULAN_LABEL.map((b, i) => <option key={i} value={i}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Tahun</label>
                        <select value={tahun} aria-label="Tahun"
                          onChange={(e) => { setTahun(Number(e.target.value)); setFormErr(""); }}
                          className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2F855A]/40 focus:border-[#2F855A] bg-gray-50 transition-colors">
                          {TAHUN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#2F855A] font-semibold bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      Membayar untuk: {BULAN_LABEL[bulanIdx]} {tahun}
                    </div>
                  </div>

                  {/* Upload */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Bukti Pembayaran</p>
                    {foto ? (
                      <div className="rounded-2xl border border-gray-200 overflow-hidden">
                        {foto.dataUrl.startsWith("data:image") ? (
                          <div className="relative">
                            <img src={foto.dataUrl} alt="Bukti" className="w-full max-h-48 object-cover" />
                            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                            <button type="button" onClick={clearFoto} title="Hapus foto"
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-[#F0FFF4] flex items-center justify-center shrink-0">
                              <FileImage className="w-5 h-5 text-[#2F855A]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{foto.nama}</p>
                              <p className="text-xs text-gray-400">Dokumen siap dikirim</p>
                            </div>
                            <button type="button" onClick={clearFoto} title="Hapus"
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#2F855A] shrink-0" />
                          <p className="text-xs text-gray-600 truncate flex-1">{foto.nama}</p>
                          <button type="button" onClick={clearFoto}
                            className="text-xs text-gray-400 hover:text-[#2F855A] font-medium shrink-0">Ganti</button>
                        </div>
                      </div>
                    ) : (
                      <label className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl p-7 cursor-pointer hover:border-[#2F855A] hover:bg-[#F0FFF4]/50 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#2F855A] transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-700 group-hover:text-[#2F855A] transition-colors">
                            Pilih atau seret file ke sini
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            JPG, PNG, PDF — gambar dikompres otomatis ke 150 KB
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#2F855A] bg-green-50 border border-green-200 rounded-full px-4 py-1.5 group-hover:bg-green-100 transition-colors">
                          Browse File
                        </span>
                        <input ref={fileRef} type="file" accept="image/*,application/pdf"
                          className="hidden" onChange={handleFileChange} />
                      </label>
                    )}
                    {fotoErr && (
                      <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                        <XCircle className="w-3.5 h-3.5 shrink-0" /> {fotoErr}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={sending || !foto}
                    className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3.5 rounded-xl hover:bg-[#276749] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {sending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim Bukti...</>
                      : <><Send className="w-4 h-4" /> Kirim Bukti Iuran</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
