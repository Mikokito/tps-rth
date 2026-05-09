"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Check } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type WasteEntry = {
  id: string;
  tanggal: string;
  jenis_sampah: string;
  berat_kg: number;
  catatan: string;
  petugas_nama: string;
  created_at: string;
};

type JenisSampah = {
  id: string;
  nama: string;
  kategori: string;
};

export default function PetugasSampahPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [jenisList, setJenisList] = useState<JenisSampah[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tanggal: today,
    jenis_sampah: "",
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
      supabase.from("jenis_sampah").select("id, nama, kategori").order("kategori").order("nama"),
      supabase.from("waste_entries").select("id, tanggal, jenis_sampah, berat_kg, catatan, petugas_nama, created_at")
        .order("tanggal", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    if (jenisData) {
      setJenisList(jenisData);
      setForm((f) => ({ ...f, jenis_sampah: jenisData[0]?.nama ?? "" }));
    }
    if (entriesData) setEntries(entriesData);
    setReady(true);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.berat_kg || Number(form.berat_kg) <= 0) errs.berat_kg = "Masukkan berat valid";
    return errs;
  }

  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErr(errs); return; }

    const supabase = createClient();
    const { data } = await supabase.from("waste_entries").insert({
      tanggal: form.tanggal,
      jenis_sampah: form.jenis_sampah,
      berat_kg: parseFloat(form.berat_kg),
      catatan: form.catatan.trim(),
      petugas_nama: session?.nama ?? "Petugas",
    }).select("id, tanggal, jenis_sampah, berat_kg, catatan, petugas_nama, created_at").single();

    if (data) setEntries((prev) => [data, ...prev]);
    setShowForm(false);
    setForm({ tanggal: today, jenis_sampah: jenisList[0]?.nama ?? "", berat_kg: "", catatan: "" });
    setFormErr({});
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("waste_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
  }

  const totalKg = entries.reduce((s, e) => s + e.berat_kg, 0);

  if (!ready) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Sampah Masuk</h1>
          <p className="text-sm text-gray-500">Catat sampah yang diterima dari masyarakat</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-500">Total Berat Tercatat</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalKg.toFixed(1)} kg</p>
        </div>
        <p className="text-[11px] text-gray-400">{entries.length} entri</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Berat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catatan</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    Belum ada data. Klik &quot;Tambah Data&quot; untuk memulai.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 text-xs">{entry.tanggal}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {entry.jenis_sampah}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 text-xs">{entry.berat_kg} kg</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{entry.catatan || "—"}</td>
                  <td className="px-4 py-3 text-right">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Tambah Data Sampah</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" title="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
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
                  <select
                    value={form.jenis_sampah}
                    onChange={(e) => setForm({ ...form, jenis_sampah: e.target.value })}
                    aria-label="Jenis sampah"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  >
                    {jenisList.map((j) => <option key={j.id}>{j.nama}</option>)}
                  </select>
                </div>
              </div>
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
              <div className="flex gap-3 pt-2">
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
