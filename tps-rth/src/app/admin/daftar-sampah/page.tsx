"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Leaf } from "lucide-react";
import { jenisData, JENIS_STORAGE_KEY, type JenisSampah } from "@/data/adminData";

const KATEGORI_OPTIONS = ["Plastik", "Kertas", "Logam", "Kaca", "Organik", "Lainnya"];

const KATEGORI_STYLE: Record<string, string> = {
  Plastik:  "bg-blue-50 text-blue-700 border-blue-100",
  Kertas:   "bg-amber-50 text-amber-700 border-amber-100",
  Logam:    "bg-slate-50 text-slate-600 border-slate-200",
  Kaca:     "bg-cyan-50 text-cyan-700 border-cyan-100",
  Organik:  "bg-green-50 text-green-700 border-green-100",
  Lainnya:  "bg-gray-100 text-gray-600 border-gray-200",
};

const EMPTY_FORM = { nama: "", kategori: KATEGORI_OPTIONS[0] };

export default function DaftarSampahPage() {
  const [jenisList, setJenisList] = useState<JenisSampah[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<JenisSampah | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [nameErr, setNameErr] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(JENIS_STORAGE_KEY);
    const list: JenisSampah[] = raw ? JSON.parse(raw) : jenisData;
    setJenisList(list);
    if (!raw) localStorage.setItem(JENIS_STORAGE_KEY, JSON.stringify(jenisData));
  }, []);

  function persist(list: JenisSampah[]) {
    setJenisList(list);
    localStorage.setItem(JENIS_STORAGE_KEY, JSON.stringify(list));
  }

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setNameErr("");
    setShowModal(true);
  }

  function openEdit(item: JenisSampah) {
    setEditItem(item);
    setForm({ nama: item.nama, kategori: item.kategori });
    setNameErr("");
    setShowModal(true);
  }

  function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nama.trim()) { setNameErr("Nama wajib diisi"); return; }
    if (editItem) {
      persist(jenisList.map((j) => j.id === editItem.id
        ? { ...j, nama: form.nama.trim(), kategori: form.kategori }
        : j
      ));
    } else {
      persist([...jenisList, { id: `j-${Date.now()}`, nama: form.nama.trim(), kategori: form.kategori }]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    persist(jenisList.filter((j) => j.id !== id));
    setDeleteConfirm(null);
  }

  const grouped: [string, JenisSampah[]][] = KATEGORI_OPTIONS
    .map((k) => [k, jenisList.filter((j) => j.kategori === k)] as [string, JenisSampah[]])
    .filter(([, items]) => items.length > 0);
  const ungrouped = jenisList.filter((j) => !KATEGORI_OPTIONS.includes(j.kategori));
  if (ungrouped.length) grouped.push(["Lainnya", ungrouped]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Daftar Jenis Sampah</h1>
          <p className="text-sm text-gray-500">{jenisList.length} jenis terdaftar · digunakan petugas saat input data</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Jenis
        </button>
      </div>

      {/* Summary per kategori */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {KATEGORI_OPTIONS.map((k) => {
          const count = jenisList.filter((j) => j.kategori === k).length;
          return (
            <div key={k} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${KATEGORI_STYLE[k]}`}>{k}</span>
              <p className="text-xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-xs text-gray-400">jenis</p>
            </div>
          );
        })}
      </div>

      {/* Grouped list */}
      <div className="space-y-4">
        {grouped.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-14 text-center">
            <Leaf className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Belum ada jenis sampah. Tambahkan yang pertama.</p>
          </div>
        ) : grouped.map(([kategori, items]) => (
          <div key={kategori} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${KATEGORI_STYLE[kategori] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {kategori}
              </span>
              <span className="text-xs text-gray-400">{items.length} jenis</span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-800">{item.nama}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirm === item.id ? (
                      <>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editItem ? "Edit Jenis Sampah" : "Tambah Jenis Sampah"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Jenis <span className="text-red-500">*</span></label>
                <input
                  value={form.nama}
                  onChange={(e) => { setForm({ ...form, nama: e.target.value }); setNameErr(""); }}
                  placeholder="Contoh: Plastik PET"
                  autoFocus
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${nameErr ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                />
                {nameErr && <p className="text-xs text-red-500 mt-1">{nameErr}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                >
                  {KATEGORI_OPTIONS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">{editItem ? "Simpan" : "Tambah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}