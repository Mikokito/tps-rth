"use client";

import { useState, useEffect, useMemo } from "react";
import { Pencil, Check, X, CheckCircle, Clock, XCircle, ImageIcon, Save } from "lucide-react";
import { type IuranSubmission, ALL_PAYMENTS_KEY, getIuranKey } from "@/app/user/iuran/page";

const HARGA_KEY = "tps_rth_harga_iuran";

type HargaIuran = { harga: number; lastModified: string };

const DEFAULT_HARGA: HargaIuran = { harga: 50000, lastModified: new Date().toISOString().slice(0, 10) };

function makeSeedPayments(now: Date): IuranSubmission[] {
  const y = now.getFullYear();
  return [
    { id: "ap1", userEmail: "user@tpsrth.com",    userNama: "Budi Santoso",  bulanIdx: 2, tahun: y, labelBulan: `Maret ${y}`,    fotoNama: "bukti-maret.jpg",    fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,2,5,10,0).toISOString(),  verifiedAt: new Date(y,2,6,9,0).toISOString() },
    { id: "ap2", userEmail: "user@tpsrth.com",    userNama: "Budi Santoso",  bulanIdx: 3, tahun: y, labelBulan: `April ${y}`,    fotoNama: "bukti-april.jpg",    fotoDataUrl: "", statusVerifikasi: "menunggu",    submittedAt: new Date(y,3,3,9,30).toISOString() },
    { id: "ap3", userEmail: "siti.r@gmail.com",   userNama: "Siti Rahayu",   bulanIdx: 1, tahun: y, labelBulan: `Februari ${y}`, fotoNama: "transfer-bca.jpg",   fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,1,4,8,0).toISOString(),   verifiedAt: new Date(y,1,5,9,0).toISOString() },
    { id: "ap4", userEmail: "siti.r@gmail.com",   userNama: "Siti Rahayu",   bulanIdx: 2, tahun: y, labelBulan: `Maret ${y}`,    fotoNama: "transfer-bca.jpg",   fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,2,4,8,0).toISOString(),   verifiedAt: new Date(y,2,6,9,0).toISOString() },
    { id: "ap5", userEmail: "siti.r@gmail.com",   userNama: "Siti Rahayu",   bulanIdx: 3, tahun: y, labelBulan: `April ${y}`,    fotoNama: "transfer-bca.jpg",   fotoDataUrl: "", statusVerifikasi: "menunggu",    submittedAt: new Date(y,3,2,10,0).toISOString() },
    { id: "ap6", userEmail: "agus.p@gmail.com",   userNama: "Agus Pratama",  bulanIdx: 1, tahun: y, labelBulan: `Februari ${y}`, fotoNama: "struk-tunai.jpg",    fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,1,5,7,30).toISOString(),  verifiedAt: new Date(y,1,6,8,0).toISOString() },
    { id: "ap7", userEmail: "agus.p@gmail.com",   userNama: "Agus Pratama",  bulanIdx: 2, tahun: y, labelBulan: `Maret ${y}`,    fotoNama: "struk-tunai.jpg",    fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,2,3,7,30).toISOString(),  verifiedAt: new Date(y,2,4,8,0).toISOString() },
    { id: "ap8", userEmail: "agus.p@gmail.com",   userNama: "Agus Pratama",  bulanIdx: 3, tahun: y, labelBulan: `April ${y}`,    fotoNama: "struk-tunai.jpg",    fotoDataUrl: "", statusVerifikasi: "menunggu",    submittedAt: new Date(y,3,4,7,30).toISOString() },
    { id: "ap9", userEmail: "dewi.l@gmail.com",   userNama: "Dewi Lestari",  bulanIdx: 2, tahun: y, labelBulan: `Maret ${y}`,    fotoNama: "bukti-transfer.jpg", fotoDataUrl: "", statusVerifikasi: "ditolak",     submittedAt: new Date(y,2,6,11,0).toISOString() },
    { id: "ap10",userEmail: "dewi.l@gmail.com",   userNama: "Dewi Lestari",  bulanIdx: 3, tahun: y, labelBulan: `April ${y}`,    fotoNama: "bukti-transfer2.jpg",fotoDataUrl: "", statusVerifikasi: "menunggu",    submittedAt: new Date(y,3,5,11,0).toISOString() },
    { id: "ap11",userEmail: "hendra.p@gmail.com", userNama: "Hendra Putra",  bulanIdx: 2, tahun: y, labelBulan: `Maret ${y}`,    fotoNama: "bukti-maret.jpg",    fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,2,5,13,0).toISOString(),  verifiedAt: new Date(y,2,6,9,0).toISOString() },
    { id: "ap12",userEmail: "hendra.p@gmail.com", userNama: "Hendra Putra",  bulanIdx: 3, tahun: y, labelBulan: `April ${y}`,    fotoNama: "bukti-april.jpg",    fotoDataUrl: "", statusVerifikasi: "diverifikasi", submittedAt: new Date(y,3,3,13,0).toISOString(),  verifiedAt: new Date(y,3,4,10,0).toISOString() },
  ];
}

function formatRp(n: number) { return "Rp " + n.toLocaleString("id-ID"); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_STYLE: Record<IuranSubmission["statusVerifikasi"], string> = {
  menunggu:    "bg-amber-50 text-amber-600",
  diverifikasi:"bg-green-100 text-green-700",
  ditolak:     "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<IuranSubmission["statusVerifikasi"], string> = {
  menunggu: "Menunggu", diverifikasi: "Diverifikasi", ditolak: "Ditolak",
};

export default function AdminIuranPage() {
  const now = new Date();
  const TAHUN_OPTIONS = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 1 + i);

  const [payments, setPayments]       = useState<IuranSubmission[]>([]);
  const [hargaData, setHargaData]     = useState<HargaIuran>(DEFAULT_HARGA);
  const [editHarga, setEditHarga]     = useState(false);
  const [hargaInput, setHargaInput]   = useState("");
  const [filterTahun, setFilterTahun] = useState(now.getFullYear());
  const [fotoModal, setFotoModal]     = useState<IuranSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<"semua" | IuranSubmission["statusVerifikasi"]>("semua");

  useEffect(() => {
    // Load harga
    const rawHarga = localStorage.getItem(HARGA_KEY);
    const h: HargaIuran = rawHarga ? JSON.parse(rawHarga) : DEFAULT_HARGA;
    setHargaData(h);
    setHargaInput(h.harga.toString());

    // Load payments
    const rawP = localStorage.getItem(ALL_PAYMENTS_KEY);
    if (rawP) {
      setPayments(JSON.parse(rawP));
    } else {
      const seed = makeSeedPayments(now);
      localStorage.setItem(ALL_PAYMENTS_KEY, JSON.stringify(seed));
      setPayments(seed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveHarga() {
    const harga = parseInt(hargaInput.replace(/\D/g, ""), 10);
    if (!harga || harga <= 0) return;
    const updated: HargaIuran = { harga, lastModified: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(HARGA_KEY, JSON.stringify(updated));
    setHargaData(updated);
    setEditHarga(false);
  }

  function updateStatus(id: string, status: IuranSubmission["statusVerifikasi"]) {
    const verifiedAt = status === "diverifikasi" ? new Date().toISOString() : undefined;

    const updated = payments.map((p) =>
      p.id === id ? { ...p, status, statusVerifikasi: status, verifiedAt } : p
    );
    setPayments(updated);
    localStorage.setItem(ALL_PAYMENTS_KEY, JSON.stringify(updated));

    // Also update user's own key
    const target = payments.find((p) => p.id === id);
    if (target) {
      const userKey = getIuranKey(target.userEmail);
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        const userList: IuranSubmission[] = JSON.parse(userRaw);
        const userUpdated = userList.map((p) =>
          p.bulanIdx === target.bulanIdx && p.tahun === target.tahun
            ? { ...p, statusVerifikasi: status, verifiedAt }
            : p
        );
        localStorage.setItem(userKey, JSON.stringify(userUpdated));
      }
    }
  }

  const filtered = useMemo(() => {
    return payments
      .filter((p) => p.tahun === filterTahun)
      .filter((p) => filterStatus === "semua" || p.statusVerifikasi === filterStatus)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [payments, filterTahun, filterStatus]);

  const stats = useMemo(() => {
    const tahunPayments = payments.filter((p) => p.tahun === filterTahun);
    const terverifikasi = tahunPayments.filter((p) => p.statusVerifikasi === "diverifikasi").length;
    const menunggu      = tahunPayments.filter((p) => p.statusVerifikasi === "menunggu").length;
    const totalNominal  = tahunPayments
      .filter((p) => p.statusVerifikasi === "diverifikasi")
      .reduce((sum, p) => sum + (p.hargaIuran ?? hargaData.harga), 0);
    return { terverifikasi, menunggu, totalNominal };
  }, [payments, filterTahun, hargaData.harga]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Iuran Nasabah</h1>
        <p className="text-sm text-gray-500">Kelola harga iuran dan verifikasi pembayaran nasabah</p>
      </div>

      {/* Harga Iuran */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Harga Iuran Bulanan</p>
            {editHarga ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">Rp</span>
                <input
                  type="number"
                  value={hargaInput}
                  onChange={(e) => setHargaInput(e.target.value)}
                  className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{formatRp(hargaData.harga)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 me-4">
            Terakhir diubah: <span className="font-medium text-gray-600">{hargaData.lastModified}</span>
          </div>
          {editHarga ? (
            <>
              <button onClick={saveHarga}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#2F855A] px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
                <Save className="w-3.5 h-3.5" /> Simpan
              </button>
              <button onClick={() => { setEditHarga(false); setHargaInput(hargaData.harga.toString()); }}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> Batal
              </button>
            </>
          ) : (
            <button onClick={() => setEditHarga(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-[#2F855A] border border-[#2F855A]/30 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Ubah Harga
            </button>
          )}
        </div>
      </div>

      {/* Statistik + filter tahun */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Terverifikasi</p>
            <p className="text-2xl font-bold text-green-600">{stats.terverifikasi}</p>
            <p className="text-xs text-gray-400 mt-0.5">pembayaran tahun {filterTahun}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Menunggu Verifikasi</p>
            <p className="text-2xl font-bold text-amber-500">{stats.menunggu}</p>
            <p className="text-xs text-gray-400 mt-0.5">perlu ditindaklanjuti</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Iuran Masuk</p>
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-3">{formatRp(stats.totalNominal)}</p>
          </div>
        </div>
      </div>

      {/* Tabel pembayaran — desktop */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex gap-2 flex-wrap justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Daftar Pembayaran Nasabah</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} data ditampilkan</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterTahun} onChange={(e) => setFilterTahun(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
              {TAHUN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diverifikasi">Diverifikasi</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nasabah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bulan</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Harga Iuran</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bukti</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal Kirim</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data untuk ditampilkan.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{p.userNama}</p>
                    <p className="text-xs text-gray-400">{p.userEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{p.labelBulan}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-gray-800">
                    {formatRp(p.hargaIuran ?? hargaData.harga)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.fotoNama ? (
                      <button onClick={() => setFotoModal(p)}
                        className="inline-flex flex-col items-center gap-1 group">
                        {p.fotoDataUrl && p.fotoDataUrl.startsWith("data:image") ? (
                          <img src={p.fotoDataUrl} alt="bukti" className="w-12 h-12 object-cover rounded-lg border border-gray-200 group-hover:border-[#2F855A] transition-colors" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center group-hover:border-[#2F855A]/50 group-hover:bg-green-50 transition-colors">
                            <ImageIcon className="w-5 h-5 text-gray-300 group-hover:text-[#2F855A]/60" />
                          </div>
                        )}
                        <span className="text-xs text-[#2F855A] font-medium">Lihat</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-gray-500">{fmtDate(p.submittedAt)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.statusVerifikasi]}`}>
                      {p.statusVerifikasi === "diverifikasi" && <CheckCircle className="w-3 h-3" />}
                      {p.statusVerifikasi === "menunggu"     && <Clock className="w-3 h-3" />}
                      {p.statusVerifikasi === "ditolak"      && <XCircle className="w-3 h-3" />}
                      {STATUS_LABEL[p.statusVerifikasi]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.statusVerifikasi === "menunggu" ? (
                      <div className="flex items-center gap-1.5 justify-center">
                        <button onClick={() => updateStatus(p.id, "diverifikasi")}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-2.5 py-1.5 rounded-lg hover:bg-[#276749] transition-colors">
                          <Check className="w-3 h-3" /> Verifikasi
                        </button>
                        <button onClick={() => updateStatus(p.id, "ditolak")}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    ) : p.statusVerifikasi === "ditolak" ? (
                      <button onClick={() => updateStatus(p.id, "menunggu")}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 hover:underline">
                        Reset
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {p.verifiedAt ? fmtDate(p.verifiedAt) : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada data.</p>
          ) : filtered.map((p) => (
            <div key={p.id} className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                {p.fotoNama ? (
                  <button onClick={() => setFotoModal(p)} className="shrink-0">
                    {p.fotoDataUrl && p.fotoDataUrl.startsWith("data:image") ? (
                      <img src={p.fotoDataUrl} alt="bukti" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </button>
                ) : null}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.userNama}</p>
                      <p className="text-xs text-gray-400">{p.userEmail}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{p.labelBulan}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.statusVerifikasi]}`}>
                      {p.statusVerifikasi === "diverifikasi" && <CheckCircle className="w-3 h-3" />}
                      {p.statusVerifikasi === "menunggu"     && <Clock className="w-3 h-3" />}
                      {p.statusVerifikasi === "ditolak"      && <XCircle className="w-3 h-3" />}
                      {STATUS_LABEL[p.statusVerifikasi]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>Dikirim: {fmtDate(p.submittedAt)}</span>
                    <span className="font-semibold text-gray-700">{formatRp(p.hargaIuran ?? hargaData.harga)}</span>
                  </div>
                </div>
              </div>
              {p.statusVerifikasi === "menunggu" && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(p.id, "diverifikasi")}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-white bg-[#2F855A] py-2 rounded-lg hover:bg-[#276749]">
                    <Check className="w-3.5 h-3.5" /> Verifikasi
                  </button>
                  <button onClick={() => updateStatus(p.id, "ditolak")}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-red-500 border border-red-200 py-2 rounded-lg hover:bg-red-50">
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal foto bukti */}
      {fotoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setFotoModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{fotoModal.userNama}</p>
                <p className="text-xs text-gray-400">{fotoModal.labelBulan}</p>
              </div>
              <button onClick={() => setFotoModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {fotoModal.fotoDataUrl && fotoModal.fotoDataUrl.startsWith("data:image") ? (
              <img src={fotoModal.fotoDataUrl} alt="bukti" className="w-full max-h-96 object-contain bg-gray-50" />
            ) : (
              <div className="p-8 text-center text-gray-400">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Pratinjau tidak tersedia</p>
                <p className="text-xs mt-1">{fotoModal.fotoNama}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}