"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Check } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import {
  jenisData,
  SAMPAH_STORAGE_KEY,
  JENIS_STORAGE_KEY,
  seedSampahEntries,
  type PetugasWasteEntry,
  type JenisSampah,
} from "@/data/adminData";

export default function PetugasSampahPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [entries, setEntries] = useState<PetugasWasteEntry[]>([]);
  const [jenisList, setJenisList] = useState<JenisSampah[]>(jenisData);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tanggal: today,
    jenisSampah: jenisData[0]?.nama ?? "Plastik PET",
    beratKg: "",
    catatan: "",
  });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setSession(getSession());
    const raw = localStorage.getItem(SAMPAH_STORAGE_KEY);
    const existing: PetugasWasteEntry[] = raw ? JSON.parse(raw) : [];
    if (existing.length === 0) {
      localStorage.setItem(SAMPAH_STORAGE_KEY, JSON.stringify(seedSampahEntries));
      setEntries(seedSampahEntries);
    } else {
      setEntries(existing);
    }
    const rawJ = localStorage.getItem(JENIS_STORAGE_KEY);
    const loaded: JenisSampah[] = rawJ ? JSON.parse(rawJ) : jenisData;
    setJenisList(loaded);
    setForm((f) => ({ ...f, jenisSampah: loaded[0]?.nama ?? f.jenisSampah }));
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.beratKg || Number(form.beratKg) <= 0) errs.beratKg = "Masukkan berat valid";
    return errs;
  }

  function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErr(errs);
      return;
    }
    const newEntry: PetugasWasteEntry = {
      id: `ps-${Date.now()}`,
      tanggal: form.tanggal,
      jenisSampah: form.jenisSampah,
      beratKg: parseFloat(form.beratKg),
      catatan: form.catatan.trim(),
      petugasNama: session?.nama ?? "Petugas",
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem(SAMPAH_STORAGE_KEY, JSON.stringify(updated));
    setShowForm(false);
    setForm({ tanggal: today, jenisSampah: jenisData[0]?.nama ?? "Plastik PET", beratKg: "", catatan: "" });
    setFormErr({});
  }

  function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(SAMPAH_STORAGE_KEY, JSON.stringify(updated));
    setDeleteConfirm(null);
  }

  const totalKg = entries.reduce((s, e) => s + e.beratKg, 0);

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Sampah Masuk</h1>
          <p className="text-sm text-gray-500">Catat sampah yang diterima dari masyarakat</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Ringkasan */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-500">Total Berat Tercatat</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalKg.toFixed(1)} kg</p>
        </div>
        <p className="text-[11px] text-gray-400">{entries.length} entri</p>
      </div>

      {/* Tabel */}
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
                      {entry.jenisSampah}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 text-xs">{entry.beratKg} kg</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{entry.catatan || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === entry.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDelete(entry.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors">
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

      {/* Modal Tambah */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Tambah Data Sampah</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Sampah</label>
                  <select
                    value={form.jenisSampah}
                    onChange={(e) => setForm({ ...form, jenisSampah: e.target.value })}
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
                  value={form.beratKg}
                  onChange={(e) => { setForm({ ...form, beratKg: e.target.value }); setFormErr({}); }}
                  placeholder="0.0"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.beratKg ? "border-red-300" : "border-gray-200"}`}
                />
                {formErr.beratKg && <p className="text-xs text-red-500 mt-1">{formErr.beratKg}</p>}
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
