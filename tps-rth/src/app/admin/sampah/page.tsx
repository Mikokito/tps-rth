"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { wasteEntries as initialEntries, sampahHarian, sampahByType, jenisData as initialJenis, type WasteEntry } from "@/data/adminData";

const HARGA_MAP: Record<string, number> = {
  Plastik: 2000, Kertas: 1500, Logam: 8000, Aluminium: 15000, Organik: 300, Kaca: 500,
};

function formatRp(n: number) { return "Rp " + n.toLocaleString("id"); }

export default function SampahPage() {
  const [entries, setEntries] = useState<WasteEntry[]>(initialEntries);
  const [jenisList] = useState(initialJenis);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    nasabahNama: "", rw: "", rt: "",
    jenisSampah: initialJenis[0]?.nama ?? "Plastik",
    beratKg: "",
  });
  const [formErr, setFormErr] = useState<Record<string, string>>({});

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!form.nasabahNama.trim()) errs.nasabahNama = "Wajib diisi";
    if (!form.rw.trim()) errs.rw = "Wajib diisi";
    if (!form.rt.trim()) errs.rt = "Wajib diisi";
    if (!form.beratKg || Number(form.beratKg) <= 0) errs.beratKg = "Masukkan berat valid";
    return errs;
  }

  function resolveHarga(jenis: string): number {
    for (const [key, val] of Object.entries(HARGA_MAP)) {
      if (jenis.toLowerCase().includes(key.toLowerCase())) return val;
    }
    return 1000;
  }

  function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErr(errs); return; }
    const harga = resolveHarga(form.jenisSampah);
    const berat = parseFloat(form.beratKg);
    setEntries([{
      id: `w-${Date.now()}`, tanggal: form.tanggal,
      nasabahNama: form.nasabahNama.trim(), rw: form.rw.trim(), rt: form.rt.trim(),
      jenisSampah: form.jenisSampah, beratKg: berat, hargaPerKg: harga, total: berat * harga,
    }, ...entries]);
    setShowForm(false);
    setForm({ tanggal: new Date().toISOString().slice(0, 10), nasabahNama: "", rw: "", rt: "", jenisSampah: jenisList[0]?.nama ?? "Plastik", beratKg: "" });
    setFormErr({});
  }

  const totalKg = entries.reduce((s, e) => s + e.beratKg, 0);
  const totalRp = entries.reduce((s, e) => s + e.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Sampah Masuk</h1>
          <p className="text-sm text-gray-500">Rekap setoran sampah nasabah</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
          <Plus className="w-4 h-4" /> Tambah Setoran
        </button>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart — daily */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Setoran Harian (kg) — 7 Hari Terakhir</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sampahHarian} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} kg`, "Berat"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="kg" radius={[4, 4, 0, 0]}>
                {sampahHarian.map((_, i) => (
                  <Cell key={i} fill={i === sampahHarian.length - 1 ? "#2F855A" : "#86efac"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Horizontal bars — by type */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Komposisi Jenis Sampah (kg)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sampahByType} layout="vertical" margin={{ top: 0, right: 32, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={64} />
              <Tooltip
                formatter={(v) => [`${v} kg`, "Berat"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="kg" radius={[0, 4, 4, 0]}>
                {sampahByType.map((item, i) => (
                  <Cell key={i} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Berat</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalKg.toFixed(1)} kg</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Nilai</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatRp(totalRp)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nasabah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RW/RT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Berat</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">{entry.tanggal}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.nasabahNama}</td>
                  <td className="px-4 py-3 text-gray-500">RW {entry.rw}/RT {entry.rt}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">{entry.jenisSampah}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{entry.beratKg} kg</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(entry.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEntries(entries.filter((e) => e.id !== entry.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Tambah Setoran Sampah</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Sampah</label>
                  <select value={form.jenisSampah} onChange={e => setForm({ ...form, jenisSampah: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
                    {jenisList.map(j => <option key={j.id}>{j.nama}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Nasabah *</label>
                <input value={form.nasabahNama} onChange={e => setForm({ ...form, nasabahNama: e.target.value })} placeholder="Nama lengkap nasabah"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.nasabahNama ? "border-red-300" : "border-gray-200"}`} />
                {formErr.nasabahNama && <p className="text-xs text-red-500 mt-1">{formErr.nasabahNama}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">RW *</label>
                  <input value={form.rw} onChange={e => setForm({ ...form, rw: e.target.value })} placeholder="01"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.rw ? "border-red-300" : "border-gray-200"}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">RT *</label>
                  <input value={form.rt} onChange={e => setForm({ ...form, rt: e.target.value })} placeholder="01"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.rt ? "border-red-300" : "border-gray-200"}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Berat (kg) *</label>
                  <input type="number" step="0.1" min="0" value={form.beratKg} onChange={e => setForm({ ...form, beratKg: e.target.value })} placeholder="0.0"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.beratKg ? "border-red-300" : "border-gray-200"}`} />
                </div>
              </div>
              {form.beratKg && Number(form.beratKg) > 0 && (
                <div className="bg-green-50 rounded-lg px-4 py-2 text-sm text-green-700">
                  Estimasi nilai: <strong>{formatRp(resolveHarga(form.jenisSampah) * Number(form.beratKg))}</strong>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}