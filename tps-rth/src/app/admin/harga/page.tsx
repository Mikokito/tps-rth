"use client";

import { useState } from "react";
import { Save, Pencil, X, Check, Plus, Trash2 } from "lucide-react";
import { wastePrices as initialPrices, jenisData as initialJenis, type WastePrice, type JenisSampah } from "@/data/adminData";

const KATEGORI_ORDER = ["Plastik", "Kertas", "Logam", "Kaca", "Organik"];
const KATEGORI_OPTIONS = ["Plastik", "Kertas", "Logam", "Kaca", "Organik", "Lainnya"];

function formatRp(n: number) { return "Rp " + n.toLocaleString("id"); }

export default function HargaPage() {
  const [prices, setPrices] = useState<WastePrice[]>(initialPrices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);

  // Jenis Sampah state
  const [jenisList, setJenisList] = useState<JenisSampah[]>(initialJenis);
  const [showJenisForm, setShowJenisForm] = useState(false);
  const [jenisForm, setJenisForm] = useState({ nama: "", kategori: "Plastik" });
  const [jenisErr, setJenisErr] = useState("");
  const [deleteJenisConfirm, setDeleteJenisConfirm] = useState<string | null>(null);

  // Price editing
  function startEdit(id: string, current: number) { setEditingId(id); setEditValue(current.toString()); }
  function cancelEdit() { setEditingId(null); setEditValue(""); }
  function confirmEdit(id: string) {
    const val = parseInt(editValue.replace(/\D/g, ""), 10);
    if (!isNaN(val) && val >= 0) setPrices((prev) => prev.map((p) => p.id === id ? { ...p, hargaPerKg: val } : p));
    setEditingId(null);
  }
  function handleSaveAll() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  // Jenis Sampah CRUD
  function handleAddJenis(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!jenisForm.nama.trim()) { setJenisErr("Nama jenis wajib diisi"); return; }
    if (jenisList.some(j => j.nama.toLowerCase() === jenisForm.nama.trim().toLowerCase())) {
      setJenisErr("Jenis sampah sudah ada"); return;
    }
    setJenisList((prev) => [...prev, { id: `j-${Date.now()}`, nama: jenisForm.nama.trim(), kategori: jenisForm.kategori }]);
    setJenisForm({ nama: "", kategori: "Plastik" });
    setShowJenisForm(false);
    setJenisErr("");
  }
  function handleDeleteJenis(id: string) {
    setJenisList((prev) => prev.filter((j) => j.id !== id));
    setDeleteJenisConfirm(null);
  }

  const grouped = KATEGORI_ORDER.map((cat) => ({
    kategori: cat,
    items: prices.filter((p) => p.kategori === cat),
  })).filter((g) => g.items.length > 0);

  const jenisByKat = KATEGORI_OPTIONS.map((cat) => ({
    kategori: cat,
    items: jenisList.filter((j) => j.kategori === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      {/* ── Harga Sampah ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Harga Sampah Hari Ini</h1>
            <p className="text-sm text-gray-500">Klik ikon pensil untuk mengubah harga per kg</p>
          </div>
          <button onClick={handleSaveAll}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${saved ? "bg-green-100 text-green-700" : "bg-[#2F855A] text-white hover:bg-[#276749]"}`}>
            {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Semua</>}
          </button>
        </div>

        {grouped.map(({ kategori, items }) => (
          <div key={kategori} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">{kategori}</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Jenis</th>
                  <th className="text-right px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Harga / kg</th>
                  <th className="w-16 px-5 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800">{item.jenis}</td>
                    <td className="px-5 py-3 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-400 text-sm">Rp</span>
                          <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(item.id); if (e.key === "Escape") cancelEdit(); }}
                            className="w-28 border border-[#2F855A] rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#2F855A]" />
                        </div>
                      ) : <span className="font-semibold text-gray-900">{formatRp(item.hargaPerKg)}</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => confirmEdit(item.id)} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(item.id, item.hargaPerKg)} className="text-gray-300 hover:text-[#2F855A] transition-colors p-1"><Pencil className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ── Jenis Sampah ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manajemen Jenis Sampah</h2>
            <p className="text-sm text-gray-500">Tambah atau hapus jenis sampah yang diterima</p>
          </div>
          <button onClick={() => { setShowJenisForm(true); setJenisErr(""); }}
            className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
            <Plus className="w-4 h-4" /> Tambah Jenis
          </button>
        </div>

        {jenisByKat.map(({ kategori, items }) => (
          <div key={kategori} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">{kategori}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-800">{item.nama}</span>
                  {deleteJenisConfirm === item.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-500 mr-1">Hapus?</span>
                      <button onClick={() => handleDeleteJenis(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteJenisConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteJenisConfirm(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {jenisList.length === 0 && (
          <p className="text-sm text-center text-gray-400 py-6">Belum ada jenis sampah. Klik "Tambah Jenis" untuk menambahkan.</p>
        )}
      </div>

      {/* Modal tambah jenis */}
      {showJenisForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Tambah Jenis Sampah</h2>
              <button onClick={() => setShowJenisForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddJenis} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Jenis *</label>
                <input value={jenisForm.nama} onChange={(e) => { setJenisForm((f) => ({ ...f, nama: e.target.value })); setJenisErr(""); }}
                  placeholder="Contoh: Plastik Botol Kaca"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${jenisErr ? "border-red-300" : "border-gray-200"}`} />
                {jenisErr && <p className="text-xs text-red-500 mt-1">{jenisErr}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select value={jenisForm.kategori} onChange={(e) => setJenisForm((f) => ({ ...f, kategori: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
                  {KATEGORI_OPTIONS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowJenisForm(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}