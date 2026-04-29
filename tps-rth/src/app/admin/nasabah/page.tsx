"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { members as initialMembers, type Member } from "@/data/adminData";

const RW_OPTIONS = ["Semua", "01", "02", "03", "04", "05"];
const RT_OPTIONS = ["Semua", "01", "02", "03", "04", "05"];

function formatRp(n: number) { return "Rp " + n.toLocaleString("id"); }

const EMPTY_FORM = {
  nama: "", rw: "", rt: "", email: "", hp: "", alamat: "",
  totalIuran: "0", statusAktif: true,
  bergabungTanggal: new Date().toISOString().slice(0, 10),
};
type FormData = Omit<typeof EMPTY_FORM, "statusAktif" | "totalIuran"> & { statusAktif: boolean; totalIuran: string };
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function NasabahPage() {
  const [data, setData] = useState<Member[]>(initialMembers);
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterRT, setFilterRT] = useState("Semua");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter((m) => {
      if (filterRW !== "Semua" && m.rw !== filterRW) return false;
      if (filterRT !== "Semua" && m.rt !== filterRT) return false;
      if (search && !m.nama.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, filterRW, filterRT, search]);

  function openAdd() {
    setEditMember(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(m: Member) {
    setEditMember(m);
    setForm({ nama: m.nama, rw: m.rw, rt: m.rt, email: m.email, hp: m.hp, alamat: m.alamat ?? "", totalIuran: m.totalIuran.toString(), statusAktif: m.statusAktif, bergabungTanggal: m.bergabungTanggal });
    setErrors({});
    setShowModal(true);
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.nama.trim()) errs.nama = "Nama wajib diisi";
    if (!form.rw.trim()) errs.rw = "RW wajib diisi";
    if (!form.rt.trim()) errs.rt = "RT wajib diisi";
    if (!form.email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Format email tidak valid";
    if (!form.hp.trim()) errs.hp = "HP wajib diisi";
    return errs;
  }

  function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (editMember) {
      setData((prev) => prev.map((m) => m.id === editMember.id ? {
        ...m, nama: form.nama.trim(), rw: form.rw.trim(), rt: form.rt.trim(),
        email: form.email.trim(), hp: form.hp.trim(), alamat: form.alamat.trim(),
        totalIuran: Number(form.totalIuran) || 0, statusAktif: form.statusAktif,
        bergabungTanggal: form.bergabungTanggal,
      } : m));
    } else {
      const newMember: Member = {
        id: `m-${Date.now()}`,
        nama: form.nama.trim(), rw: form.rw.trim(), rt: form.rt.trim(),
        email: form.email.trim(), hp: form.hp.trim(), alamat: form.alamat.trim(),
        totalIuran: Number(form.totalIuran) || 0,
        statusAktif: form.statusAktif,
        bergabungTanggal: form.bergabungTanggal,
      };
      setData((prev) => [...prev, newMember]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
  }

  function upd(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  const aktifCount = filtered.filter((m) => m.statusAktif).length;
  const totalIuran = filtered.reduce((s, m) => s + m.totalIuran, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Nasabah & Iuran</h1>
          <p className="text-sm text-gray-500">{data.length} nasabah terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
          <Plus className="w-4 h-4" /> Tambah Nasabah
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total Ditampilkan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Nasabah Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{aktifCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total Iuran</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{formatRp(totalIuran)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">RW</label>
          <select value={filterRW} onChange={(e) => setFilterRW(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
            {RW_OPTIONS.map((rw) => <option key={rw}>{rw}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">RT</label>
          <select value={filterRT} onChange={(e) => setFilterRT(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
            {RT_OPTIONS.map((rt) => <option key={rt}>{rt}</option>)}
          </select>
        </div>
        {(filterRW !== "Semua" || filterRT !== "Semua" || search) && (
          <button onClick={() => { setFilterRW("Semua"); setFilterRT("Semua"); setSearch(""); }} className="text-xs text-[#2F855A] font-medium hover:underline">Reset</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RW/RT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">No. HP</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Iuran</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Tidak ada nasabah yang sesuai.</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.nama}</td>
                  <td className="px-4 py-3 text-gray-500">RW {m.rw}/RT {m.rt}</td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3 text-gray-500">{m.hp}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(m.totalIuran)}</td>
                  <td className="px-4 py-3 text-center">
                    {m.statusAktif
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle className="w-3 h-3" /> Aktif</span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"><XCircle className="w-3 h-3" /> Tidak Aktif</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      {deleteConfirm === m.id ? (
                        <>
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editMember ? "Edit Data Nasabah" : "Tambah Nasabah Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {(["nama", "email", "hp"] as (keyof FormData)[]).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">{field === "hp" ? "No. HP / WhatsApp" : field.charAt(0).toUpperCase() + field.slice(1)} <span className="text-red-500">*</span></label>
                  <input value={form[field] as string} onChange={upd(field)} placeholder={field === "email" ? "email@contoh.com" : field === "hp" ? "08xx-xxxx-xxxx" : ""}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${errors[field] ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
                  {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {(["rw", "rt"] as (keyof FormData)[]).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{field.toUpperCase()} <span className="text-red-500">*</span></label>
                    <input value={form[field] as string} onChange={upd(field)} placeholder="01"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${errors[field] ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
                    {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat</label>
                <input value={form.alamat} onChange={upd("alamat")} placeholder="Jl. Nama Jalan No. X..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Iuran (Rp)</label>
                  <input type="number" min="0" value={form.totalIuran} onChange={upd("totalIuran")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tgl. Bergabung</label>
                  <input type="date" value={form.bergabungTanggal} onChange={upd("bergabungTanggal")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-700">Status Aktif</label>
                <button type="button" onClick={() => setForm((f) => ({ ...f, statusAktif: !f.statusAktif }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.statusAktif ? "bg-[#2F855A]" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.statusAktif ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-gray-600">{form.statusAktif ? "Aktif" : "Tidak Aktif"}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">{editMember ? "Simpan Perubahan" : "Tambah Nasabah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}