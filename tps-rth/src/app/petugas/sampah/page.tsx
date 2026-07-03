"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, Trash2, Check, Calendar, History, Scale, Leaf } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type WasteEntry = {
  id: string;
  tanggal: string;
  berat_kg: number;
  catatan: string | null;
  created_at: string;
  jenis_sampah: { nama: string; kategori: string } | null;
};

type JenisSampah = {
  id: string;
  nama: string;
  kategori: string;
  contoh_barang: string | null;
};

const ENTRY_SELECT = "id, tanggal, berat_kg, catatan, created_at, jenis_sampah:jenis_sampah_id ( nama, kategori )";

const KATEGORI_STYLE: Record<string, string> = {
  Plastik: "bg-blue-50 text-blue-700",
  "Kertas/Kardus": "bg-amber-50 text-amber-700",
  Logam: "bg-slate-100 text-slate-600",
  Kaca: "bg-cyan-50 text-cyan-700",
  "Non-daur ulang": "bg-red-50 text-red-600",
};

function KategoriBadge({ kategori }: { kategori?: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${KATEGORI_STYLE[kategori ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
      {kategori ?? "—"}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function PetugasSampahPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [jenisList, setJenisList] = useState<JenisSampah[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"hari_ini" | "riwayat">("hari_ini");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("");
  const [form, setForm] = useState({
    tanggal: today,
    jenis_sampah_id: "",
    berat_kg: "",
    catatan: "",
  });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      loadData();
    });
  }, []);

  async function loadData() {
    const supabase = createClient();
    const [{ data: jenisData }, { data: entriesData }] = await Promise.all([
      supabase.from("jenis_sampah").select("id, nama, kategori, contoh_barang").order("kategori").order("nama"),
      supabase.from("waste_entries").select(ENTRY_SELECT)
        .order("tanggal", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    if (jenisData) {
      setJenisList(jenisData);
      setForm((f) => ({ ...f, jenis_sampah_id: jenisData[0]?.id ?? "" }));
    }
    if (entriesData) setEntries(entriesData as unknown as WasteEntry[]);
    setReady(true);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.berat_kg || Number(form.berat_kg) <= 0) errs.berat_kg = "Masukkan berat valid";
    if (!form.jenis_sampah_id) errs.jenis_sampah_id = "Pilih detail sampah";
    return errs;
  }

  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErr(errs); return; }
    if (!session) { setFormErr({ submit: "Sesi tidak ditemukan, silakan login ulang." }); return; }

    const supabase = createClient();
    const { data, error } = await supabase.from("waste_entries").insert({
      tanggal: form.tanggal,
      petugas_id: session.id,
      jenis_sampah_id: form.jenis_sampah_id,
      berat_kg: parseFloat(form.berat_kg),
      catatan: form.catatan.trim() || null,
      created_by: session.id,
    }).select(ENTRY_SELECT).single();

    if (error) {
      setFormErr({ submit: error.message });
      return;
    }

    if (data) setEntries((prev) => [data as unknown as WasteEntry, ...prev]);
    setShowForm(false);
    setTab("hari_ini");
    setForm({
      tanggal: today,
      jenis_sampah_id: jenisList[0]?.id ?? "",
      berat_kg: "",
      catatan: "",
    });
    setFormErr({});
  }

  async function handleDelete(id: string) {
    const entry = entries.find((e) => e.id === id);
    if (!entry || entry.tanggal !== today) { setDeleteConfirm(null); return; }
    const supabase = createClient();
    await supabase.from("waste_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
  }

  const todayEntries = useMemo(() => entries.filter((e) => e.tanggal === today), [entries, today]);
  const todayTotal = todayEntries.reduce((s, e) => s + e.berat_kg, 0);
  const totalAll = entries.reduce((s, e) => s + e.berat_kg, 0);

  const kategoriOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(jenisList.map((j) => j.kategori)))],
    [jenisList],
  );

  const historyFiltered = useMemo(() => {
    return entries.filter((e) => {
      const matchKategori = filterKategori === "Semua" || e.jenis_sampah?.kategori === filterKategori;
      const matchBulan = !filterBulan || e.tanggal.slice(0, 7) === filterBulan;
      return matchKategori && matchBulan;
    });
  }, [entries, filterKategori, filterBulan]);
  const historyTotal = historyFiltered.reduce((s, e) => s + e.berat_kg, 0);
  const hasHistoryFilters = filterKategori !== "Semua" || !!filterBulan;

  const BULAN_LABEL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function fmtBulan(ym: string) {
    const [y, m] = ym.split("-").map(Number);
    return `${BULAN_LABEL[m - 1]} ${y}`;
  }

  const bulanOptions = useMemo(() => {
    const set = new Set(entries.map((e) => e.tanggal.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  const selectedDetail = jenisList.find((j) => j.id === form.jenis_sampah_id);

  if (!ready) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;
  }

  const listToShow = tab === "hari_ini" ? todayEntries : historyFiltered;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Sampah</h1>
          <p className="text-sm text-gray-500">Catat sampah yang diterima dari masyarakat</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#276749] active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 truncate">Berat Hari Ini</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{todayTotal.toFixed(1)} kg</p>
            <p className="text-[11px] text-gray-400">{todayEntries.length} entri</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 truncate">Total Keseluruhan</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{totalAll.toFixed(1)} kg</p>
            <p className="text-[11px] text-gray-400">{entries.length} entri</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setTab("hari_ini")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "hari_ini" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Hari Ini
          {todayEntries.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === "hari_ini" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
              {todayEntries.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("riwayat")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "riwayat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="w-3.5 h-3.5" /> Riwayat
        </button>
      </div>

      {/* Riwayat filters */}
      {tab === "riwayat" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3.5">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-36">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori</label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  aria-label="Filter kategori"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white"
                >
                  {kategoriOptions.map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-36">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bulan</label>
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  aria-label="Filter bulan"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white"
                >
                  <option value="">Semua Bulan</option>
                  {bulanOptions.map((ym) => <option key={ym} value={ym}>{fmtBulan(ym)}</option>)}
                </select>
              </div>
              {hasHistoryFilters && (
                <button
                  type="button"
                  onClick={() => { setFilterKategori("Semua"); setFilterBulan(""); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
          {hasHistoryFilters && (
            <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs">
              {filterKategori !== "Semua" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                  <KategoriBadge kategori={filterKategori} />
                </span>
              )}
              {filterBulan && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-medium">
                  {fmtBulan(filterBulan)}
                </span>
              )}
              <span className="text-gray-400 ml-auto">
                {historyFiltered.length} entri · <span className="font-semibold text-gray-600">{historyTotal.toFixed(1)} kg</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          {tab === "hari_ini" ? <Calendar className="w-4 h-4 text-[#2F855A]" /> : <History className="w-4 h-4 text-[#2F855A]" />}
          <h2 className="text-sm font-semibold text-gray-800">{tab === "hari_ini" ? "Input Hari Ini" : "Riwayat Input"}</h2>
          <span className="text-xs text-gray-400 ml-auto">{listToShow.length} entri</span>
        </div>

        {listToShow.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Leaf className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              {tab === "hari_ini" ? "Belum ada input sampah hari ini." : hasHistoryFilters ? "Tidak ada data sesuai filter." : "Belum ada riwayat input."}
            </p>
            {tab === "hari_ini" && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-3 text-xs font-semibold text-[#2F855A] hover:underline"
              >
                + Tambah data sekarang
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {tab === "riwayat" && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Berat</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catatan</th>
                    {tab === "hari_ini" && <th className="px-4 py-3"><span className="sr-only">Aksi</span></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listToShow.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      {tab === "riwayat" && <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{fmtDate(entry.tanggal)}</td>}
                      <td className="px-4 py-3.5"><KategoriBadge kategori={entry.jenis_sampah?.kategori} /></td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">{entry.jenis_sampah?.nama ?? "—"}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-900 text-xs whitespace-nowrap">{entry.berat_kg} kg</td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs max-w-48 truncate">{entry.catatan || "—"}</td>
                      {tab === "hari_ini" && (
                        <td className="px-4 py-3.5 text-right">
                          {deleteConfirm === entry.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => handleDelete(entry.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Konfirmasi hapus">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => setDeleteConfirm(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Batal">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setDeleteConfirm(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {listToShow.map((entry) => (
                <div key={entry.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <KategoriBadge kategori={entry.jenis_sampah?.kategori} />
                        {tab === "riwayat" && <span className="text-[11px] text-gray-400">{fmtDate(entry.tanggal)}</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{entry.jenis_sampah?.nama ?? "—"}</p>
                      {entry.catatan && <p className="text-xs text-gray-400 mt-0.5">{entry.catatan}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-bold text-gray-900">{entry.berat_kg} kg</p>
                      {tab === "hari_ini" && (
                        deleteConfirm === entry.id ? (
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => handleDelete(entry.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Konfirmasi hapus">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => setDeleteConfirm(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Batal">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setDeleteConfirm(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center pb-4 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-semibold text-gray-900">Tambah Data Sampah</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" title="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    title="Tanggal"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Sampah</label>
                  <input
                    value={selectedDetail?.kategori ?? ""}
                    readOnly
                    disabled
                    title="Jenis sampah (otomatis dari Detail Sampah)"
                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detail Sampah</label>
                <select
                  value={form.jenis_sampah_id}
                  onChange={(e) => setForm({ ...form, jenis_sampah_id: e.target.value })}
                  aria-label="Detail sampah"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                >
                  {jenisList.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                </select>
              </div>
              {selectedDetail?.contoh_barang && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                  Contoh barang: {selectedDetail.contoh_barang}
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Berat (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.berat_kg}
                  onChange={(e) => { setForm({ ...form, berat_kg: e.target.value }); setFormErr({}); }}
                  placeholder="0.0"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.berat_kg ? "border-red-300" : "border-gray-200"}`}
                />
                {formErr.berat_kg && <p className="text-xs text-red-500 mt-1">{formErr.berat_kg}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan</label>
                <input
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  placeholder="Misal: dari RW 02, kondisi bersih"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>
              {formErr.submit && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formErr.submit}</p>
              )}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
