"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Check, X, Clock, Send, FileImage } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";

export type IuranSubmission = {
  id: string;
  userEmail: string;
  userNama: string;
  bulanIdx: number;
  tahun: number;
  labelBulan: string;
  fotoNama: string;
  fotoDataUrl: string;
  statusVerifikasi: "menunggu" | "diverifikasi" | "ditolak";
  submittedAt: string;
  verifiedAt?: string;
  hargaIuran?: number;
};

export const BULAN_LABEL = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export function getIuranKey(email: string) {
  return `tps_rth_iuran_${email}`;
}

export const ALL_PAYMENTS_KEY = "tps_rth_all_payments";
const HARGA_KEY = "tps_rth_harga_iuran";

function makeSeed(session: { email: string; nama: string }, now: Date): IuranSubmission[] {
  return [
    {
      id: "iu1",
      userEmail: session.email,
      userNama: session.nama,
      bulanIdx: 2,
      tahun: now.getFullYear(),
      labelBulan: `Maret ${now.getFullYear()}`,
      fotoNama: "bukti-maret.jpg",
      fotoDataUrl: "",
      statusVerifikasi: "diverifikasi",
      submittedAt: new Date(now.getFullYear(), 2, 5, 10, 0).toISOString(),
      verifiedAt: new Date(now.getFullYear(), 2, 6, 9, 0).toISOString(),
    },
    {
      id: "iu2",
      userEmail: session.email,
      userNama: session.nama,
      bulanIdx: 3,
      tahun: now.getFullYear(),
      labelBulan: `April ${now.getFullYear()}`,
      fotoNama: "bukti-april.jpg",
      fotoDataUrl: "",
      statusVerifikasi: "menunggu",
      submittedAt: new Date(now.getFullYear(), 3, 3, 9, 30).toISOString(),
    },
  ];
}

const STATUS_STYLE: Record<IuranSubmission["statusVerifikasi"], string> = {
  menunggu:    "bg-amber-50 text-amber-600 border border-amber-200",
  diverifikasi:"bg-green-50 text-green-700 border border-green-200",
  ditolak:     "bg-red-50 text-red-500 border border-red-200",
};
const STATUS_LABEL_MAP: Record<IuranSubmission["statusVerifikasi"], string> = {
  menunggu:    "Menunggu Verifikasi",
  diverifikasi:"Sudah Diverifikasi",
  ditolak:     "Ditolak",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function UserIuranPage() {
  const now = new Date();
  const TAHUN_OPTIONS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const [session, setSession] = useState<SessionUser | null>(null);
  const [submissions, setSubmissions] = useState<IuranSubmission[]>([]);
  const [bulanIdx, setBulanIdx] = useState(now.getMonth());
  const [tahun, setTahun] = useState(now.getFullYear());
  const [foto, setFoto] = useState<{ nama: string; dataUrl: string } | null>(null);
  const [fotoErr, setFotoErr] = useState("");
  const [formErr, setFormErr] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) return;
    const raw = localStorage.getItem(getIuranKey(s.email));
    if (raw) {
      setSubmissions(JSON.parse(raw));
    } else {
      const seed = makeSeed(s, now);
      localStorage.setItem(getIuranKey(s.email), JSON.stringify(seed));
      setSubmissions(seed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFotoErr("Ukuran file maksimal 5 MB"); return; }
    setFotoErr("");
    const reader = new FileReader();
    reader.onload = () => setFoto({ nama: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  function clearFoto() {
    setFoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!foto) { setFormErr("Foto bukti wajib diunggah"); return; }
    const labelBulan = `${BULAN_LABEL[bulanIdx]} ${tahun}`;
    if (submissions.some((s) => s.bulanIdx === bulanIdx && s.tahun === tahun)) {
      setFormErr(`Iuran ${labelBulan} sudah pernah diajukan`);
      return;
    }
    setFormErr("");
    setSending(true);
    setTimeout(() => {
      if (!session) return;
      const rawHarga = localStorage.getItem(HARGA_KEY);
      const hargaIuran: number = rawHarga ? JSON.parse(rawHarga).harga : 50000;
      const newSub: IuranSubmission = {
        id: `iu-${Date.now()}`,
        userEmail: session.email,
        userNama: session.nama,
        bulanIdx, tahun, labelBulan,
        fotoNama: foto.nama,
        fotoDataUrl: foto.dataUrl,
        statusVerifikasi: "menunggu",
        submittedAt: new Date().toISOString(),
        hargaIuran,
      };

      // Write to user key
      const updated = [newSub, ...submissions];
      setSubmissions(updated);
      localStorage.setItem(getIuranKey(session.email), JSON.stringify(updated));

      // Write to shared admin key
      const adminRaw = localStorage.getItem(ALL_PAYMENTS_KEY);
      const adminList: IuranSubmission[] = adminRaw ? JSON.parse(adminRaw) : [];
      localStorage.setItem(ALL_PAYMENTS_KEY, JSON.stringify([newSub, ...adminList]));

      clearFoto();
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }, 600);
  }

  if (!session) return null;

  const sorted = [...submissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Iuran Bulanan</h1>
        <p className="text-sm text-gray-500">Kirim bukti pembayaran dan pantau status verifikasi admin</p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          <Check className="w-4 h-4 shrink-0" /> Pengajuan berhasil dikirim! Menunggu verifikasi admin.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Kirim Bukti Iuran</h2>
            <p className="text-xs text-gray-400 mt-0.5">Upload struk atau bukti transfer pembayaran</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {formErr && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <X className="w-4 h-4 shrink-0" /> {formErr}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bulan <span className="text-red-500">*</span></label>
                <select value={bulanIdx} onChange={(e) => { setBulanIdx(Number(e.target.value)); setFormErr(""); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
                  {BULAN_LABEL.map((b, i) => <option key={i} value={i}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun <span className="text-red-500">*</span></label>
                <select value={tahun} onChange={(e) => { setTahun(Number(e.target.value)); setFormErr(""); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
                  {TAHUN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Foto Bukti Pembayaran <span className="text-red-500">*</span></label>
              {foto ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {foto.dataUrl.startsWith("data:image") ? (
                    <img src={foto.dataUrl} alt="bukti" className="w-full max-h-52 object-contain bg-gray-50" />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-5 bg-gray-50 justify-center">
                      <FileImage className="w-8 h-8 text-gray-300" />
                      <span className="text-sm text-gray-500">{foto.nama}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-white">
                    <span className="text-xs text-gray-400 truncate max-w-50">{foto.nama}</span>
                    <button type="button" onClick={clearFoto} className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1">
                      <X className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#2F855A]/50 hover:text-[#2F855A] transition-colors">
                  <Upload className="w-7 h-7" />
                  <span className="text-sm font-medium">Klik untuk upload foto</span>
                  <span className="text-xs">JPG, PNG, PDF — maks. 5 MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
              {fotoErr && <p className="text-xs text-red-500 mt-1.5">{fotoErr}</p>}
            </div>

            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors disabled:opacity-60">
              <Send className="w-4 h-4" />
              {sending ? "Mengirim..." : "Kirim Iuran"}
            </button>
          </form>
        </div>

        {/* Riwayat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Riwayat Pengajuan</h2>
            <p className="text-xs text-gray-400 mt-0.5">{submissions.length} pengajuan</p>
          </div>
          {sorted.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Belum ada pengajuan iuran.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-135 overflow-y-auto">
              {sorted.map((sub) => (
                <div key={sub.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{sub.labelBulan}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Dikirim: {fmtDate(sub.submittedAt)}</p>
                      {sub.fotoNama && <p className="text-xs text-gray-300 mt-0.5 truncate">📎 {sub.fotoNama}</p>}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[sub.statusVerifikasi]}`}>
                      {sub.statusVerifikasi === "diverifikasi" && <Check className="w-3 h-3" />}
                      {sub.statusVerifikasi === "menunggu"    && <Clock className="w-3 h-3" />}
                      {sub.statusVerifikasi === "ditolak"     && <X className="w-3 h-3" />}
                      {STATUS_LABEL_MAP[sub.statusVerifikasi]}
                    </span>
                  </div>
                  {sub.fotoDataUrl && sub.fotoDataUrl.startsWith("data:image") && (
                    <img src={sub.fotoDataUrl} alt="bukti" className="mt-2 h-24 rounded-lg object-cover border border-gray-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}