"use client";

import { useState, useEffect, useMemo } from "react";
import { Pencil, Check, X, CheckCircle, Clock, XCircle, ImageIcon, Save, AlertTriangle } from "lucide-react";
import { getAllIuran, updateIuranStatus, getHargaIuran, setHargaIuran, type IuranRecord, type IuranStatus } from "@/app/actions/iuran";
import { BULAN_LABEL } from "@/lib/bulan";

function formatRp(n: number) { return "Rp " + n.toLocaleString("id-ID"); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_STYLE: Record<IuranStatus, string> = {
  menunggu:    "bg-amber-50 text-amber-600",
  diverifikasi:"bg-green-100 text-green-700",
  ditolak:     "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<IuranStatus, string> = {
  menunggu: "Menunggu", diverifikasi: "Diverifikasi", ditolak: "Ditolak",
};

export default function AdminIuranPage() {
  const now = new Date();
  const TAHUN_OPTIONS = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 1 + i);

  const [payments, setPayments]       = useState<IuranRecord[]>([]);
  const [harga, setHarga]             = useState(50000);
  const [editHarga, setEditHarga]     = useState(false);
  const [hargaInput, setHargaInput]   = useState("");
  const [filterTahun, setFilterTahun] = useState(now.getFullYear());
  const [fotoModal, setFotoModal]     = useState<IuranRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<"semua" | IuranStatus>("semua");
  const [ready, setReady]             = useState(false);
  const [loadError, setLoadError]     = useState<string | undefined>();

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: iuranData, error }, hargaData] = await Promise.all([
      getAllIuran(),
      getHargaIuran(),
    ]);
    setPayments(iuranData);
    setHarga(hargaData.jumlah);
    setHargaInput(hargaData.jumlah.toString());
    setLoadError(error);
    setReady(true);
  }

  async function saveHarga() {
    const jumlah = parseInt(hargaInput.replace(/\D/g, ""), 10);
    if (!jumlah || jumlah <= 0) return;
    await setHargaIuran(jumlah);
    setHarga(jumlah);
    setEditHarga(false);
  }

  async function updateStatus(id: string, status: IuranStatus) {
    const { error } = await updateIuranStatus(id, status);
    if (error) return;
    const verified_at = status === "diverifikasi" ? new Date().toISOString() : null;
    setPayments((prev) =>
      prev.map((p) => p.id === id ? { ...p, status, verified_at } : p)
    );
  }

  const filtered = useMemo(() => {
    return payments
      .filter((p) => p.tahun === filterTahun)
      .filter((p) => filterStatus === "semua" || p.status === filterStatus)
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  }, [payments, filterTahun, filterStatus]);

  const stats = useMemo(() => {
    const tahunPayments = payments.filter((p) => p.tahun === filterTahun);
    const terverifikasi = tahunPayments.filter((p) => p.status === "diverifikasi").length;
    const menunggu      = tahunPayments.filter((p) => p.status === "menunggu").length;
    const totalNominal  = tahunPayments
      .filter((p) => p.status === "diverifikasi")
      .reduce((sum, p) => sum + (p.harga_iuran ?? harga), 0);
    return { terverifikasi, menunggu, totalNominal };
  }, [payments, filterTahun, harga]);

  if (!ready) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Iuran Nasabah</h1>
        <p className="text-sm text-gray-500">Kelola harga iuran dan verifikasi pembayaran nasabah</p>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Gagal memuat data: {loadError}</span>
        </div>
      )}

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
                  title="Harga iuran"
                  className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{formatRp(harga)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editHarga ? (
            <>
              <button type="button" onClick={saveHarga}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#2F855A] px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
                <Save className="w-3.5 h-3.5" /> Simpan
              </button>
              <button type="button" onClick={() => { setEditHarga(false); setHargaInput(harga.toString()); }}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> Batal
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setEditHarga(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-[#2F855A] border border-[#2F855A]/30 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Ubah Harga
            </button>
          )}
        </div>
      </div>

      {/* Statistik */}
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

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex gap-2 flex-wrap justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Daftar Pembayaran Nasabah</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} data ditampilkan</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterTahun} onChange={(e) => setFilterTahun(Number(e.target.value))} aria-label="Filter tahun"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
              {TAHUN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} aria-label="Filter status"
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
                    <p className="text-sm font-medium text-gray-900">{p.user_nama}</p>
                    <p className="text-xs text-gray-400">{p.nasabah_email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{BULAN_LABEL[p.bulan - 1]} {p.tahun}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-gray-800">
                    {formatRp(p.harga_iuran ?? harga)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.foto_nama ? (
                      <button type="button" onClick={() => setFotoModal(p)}
                        className="inline-flex flex-col items-center gap-1 group">
                        {p.foto_data_url ? (
                          <img src={p.foto_data_url} alt="bukti" className="w-12 h-12 object-cover rounded-lg border border-gray-200 group-hover:border-[#2F855A] transition-colors" />
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
                  <td className="px-4 py-3.5 text-center text-xs text-gray-500">{fmtDate(p.submitted_at)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.status]}`}>
                      {p.status === "diverifikasi" && <CheckCircle className="w-3 h-3" />}
                      {p.status === "menunggu"     && <Clock className="w-3 h-3" />}
                      {p.status === "ditolak"      && <XCircle className="w-3 h-3" />}
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.status === "menunggu" ? (
                      <div className="flex items-center gap-1.5 justify-center">
                        <button type="button" onClick={() => updateStatus(p.id, "diverifikasi")}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-2.5 py-1.5 rounded-lg hover:bg-[#276749] transition-colors">
                          <Check className="w-3 h-3" /> Verifikasi
                        </button>
                        <button type="button" onClick={() => updateStatus(p.id, "ditolak")}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    ) : p.status === "ditolak" ? (
                      <button type="button" onClick={() => updateStatus(p.id, "menunggu")}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 hover:underline">
                        Reset
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {p.verified_at ? fmtDate(p.verified_at) : "—"}
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
                {p.foto_nama ? (
                  <button type="button" onClick={() => setFotoModal(p)} className="shrink-0">
                    {p.foto_data_url ? (
                      <img src={p.foto_data_url} alt="bukti" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
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
                      <p className="text-sm font-semibold text-gray-900">{p.user_nama}</p>
                      <p className="text-xs text-gray-400">{p.nasabah_email}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{BULAN_LABEL[p.bulan - 1]} {p.tahun}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.status]}`}>
                      {p.status === "diverifikasi" && <CheckCircle className="w-3 h-3" />}
                      {p.status === "menunggu"     && <Clock className="w-3 h-3" />}
                      {p.status === "ditolak"      && <XCircle className="w-3 h-3" />}
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>Dikirim: {fmtDate(p.submitted_at)}</span>
                    <span className="font-semibold text-gray-700">{formatRp(p.harga_iuran ?? harga)}</span>
                  </div>
                </div>
              </div>
              {p.status === "menunggu" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateStatus(p.id, "diverifikasi")}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-white bg-[#2F855A] py-2 rounded-lg hover:bg-[#276749]">
                    <Check className="w-3.5 h-3.5" /> Verifikasi
                  </button>
                  <button type="button" onClick={() => updateStatus(p.id, "ditolak")}
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
                <p className="font-semibold text-gray-900 text-sm">{fotoModal.user_nama}</p>
                <p className="text-xs text-gray-400">{BULAN_LABEL[fotoModal.bulan - 1]} {fotoModal.tahun}</p>
              </div>
              <button type="button" onClick={() => setFotoModal(null)} className="text-gray-400 hover:text-gray-600" title="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            {fotoModal.foto_data_url ? (
              <img src={fotoModal.foto_data_url} alt="bukti" className="w-full max-h-96 object-contain bg-gray-50" />
            ) : (
              <div className="p-8 text-center text-gray-400">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Pratinjau tidak tersedia</p>
                <p className="text-xs mt-1">{fotoModal.foto_nama}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
