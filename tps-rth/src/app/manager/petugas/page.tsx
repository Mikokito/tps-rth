"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle, Clock, X, Check } from "lucide-react";
import { staffMembers as initialStaff, type StaffMember } from "@/data/adminData";

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id");
}

const JABATAN_OPTIONS = [
  "Ketua", "Wakil Ketua", "Sekretaris", "Bendahara",
  "Koordinator Lapangan", "Tim Edukasi", "Petugas Lapangan", "Lainnya",
];

const EMPTY_FORM = {
  nama: "", jabatan: "Ketua", rw: "", rt: "", hp: "", gajiPokok: "",
};

type FormData = typeof EMPTY_FORM;
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ManagerPetugasPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openAdd() {
    setEditStaff(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true);
  }

  function openEdit(s: StaffMember) {
    setEditStaff(s);
    setForm({ nama: s.nama, jabatan: s.jabatan, rw: s.rw, rt: s.rt, hp: s.hp, gajiPokok: s.gajiPokok.toString() });
    setErrors({}); setShowModal(true);
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.nama.trim()) errs.nama = "Nama wajib diisi";
    if (!form.rw.trim()) errs.rw = "RW wajib diisi";
    if (!form.rt.trim()) errs.rt = "RT wajib diisi";
    if (!form.hp.trim()) errs.hp = "HP wajib diisi";
    if (!form.gajiPokok || isNaN(Number(form.gajiPokok)) || Number(form.gajiPokok) < 0)
      errs.gajiPokok = "Masukkan gaji valid";
    return errs;
  }

  function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (editStaff) {
      setStaff((prev) => prev.map((s) =>
        s.id === editStaff.id
          ? { ...s, nama: form.nama.trim(), jabatan: form.jabatan, rw: form.rw.trim(), rt: form.rt.trim(), hp: form.hp.trim(), gajiPokok: Number(form.gajiPokok) }
          : s
      ));
    } else {
      const newStaff: StaffMember = {
        id: `s-${Date.now()}`,
        nama: form.nama.trim(), jabatan: form.jabatan, rw: form.rw.trim(),
        rt: form.rt.trim(), hp: form.hp.trim(), gajiPokok: Number(form.gajiPokok),
        statusGaji: "belum", bulan: "Mei 2025",
      };
      setStaff((prev) => [...prev, newStaff]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  }

  function toggleGaji(id: string) {
    setStaff((prev) => prev.map((s) =>
      s.id === id ? { ...s, statusGaji: s.statusGaji === "sudah" ? "belum" : "sudah" } : s
    ));
  }

  function Field({ label, field, type = "text", placeholder }: { label: string; field: keyof FormData; type?: string; placeholder?: string }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
        <input
          type={type}
          value={form[field]}
          onChange={(e) => { setForm((f) => ({ ...f, [field]: e.target.value })); if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined })); }}
          placeholder={placeholder}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${errors[field] ? "border-red-300 bg-red-50" : "border-gray-200"}`}
        />
        {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
      </div>
    );
  }

  const totalGaji = staff.reduce((s, m) => s + m.gajiPokok, 0);
  const sudahBayar = staff.filter((s) => s.statusGaji === "sudah").reduce((t, s) => t + s.gajiPokok, 0);
  const sudahCount = staff.filter((s) => s.statusGaji === "sudah").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data &amp; Gaji Petugas</h1>
          <p className="text-sm text-gray-500">{staff.length} petugas terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
          <Plus className="w-4 h-4" /> Tambah Petugas
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Anggaran Gaji</p>
          <p className="text-lg font-bold text-gray-900">{formatRp(totalGaji)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{staff.length} petugas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <p className="text-xs text-gray-500 mb-1">Sudah Dibayar</p>
          <p className="text-lg font-bold text-green-600">{formatRp(sudahBayar)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{sudahCount} orang</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <p className="text-xs text-gray-500 mb-1">Belum Dibayar</p>
          <p className="text-lg font-bold text-red-500">{formatRp(totalGaji - sudahBayar)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{staff.length - sudahCount} orang</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress Pembayaran Gaji</span>
          <span className="text-sm font-semibold text-[#2F855A]">
            {sudahCount}/{staff.length} ({staff.length ? Math.round((sudahCount / staff.length) * 100) : 0}%)
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-[#2F855A] rounded-full transition-all" style={{ width: `${staff.length ? (sudahCount / staff.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jabatan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RW/RT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">No. HP</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gaji Pokok</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Gaji</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Belum ada petugas.</td></tr>
              )}
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{member.jabatan}</td>
                  <td className="px-4 py-3 text-gray-500">RW {member.rw}/RT {member.rt}</td>
                  <td className="px-4 py-3 text-gray-500">{member.hp}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(member.gajiPokok)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleGaji(member.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${member.statusGaji === "sudah" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                    >
                      {member.statusGaji === "sudah" ? <><CheckCircle className="w-3.5 h-3.5" /> Sudah</> : <><Clock className="w-3.5 h-3.5" /> Belum</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(member)} className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteConfirm === member.id ? (
                        <>
                          <button onClick={() => handleDelete(member.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(member.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {staff.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Total</span>
            <span className="font-bold text-gray-900">{formatRp(totalGaji)}</span>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editStaff ? "Edit Data Petugas" : "Tambah Petugas Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Field label="Nama Lengkap" field="nama" placeholder="Nama petugas" />
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
                <select value={form.jabatan} onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
                  {JABATAN_OPTIONS.map((j) => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="RW" field="rw" placeholder="01" />
                <Field label="RT" field="rt" placeholder="01" />
              </div>
              <Field label="No. HP / WhatsApp" field="hp" placeholder="08xx-xxxx-xxxx" />
              <Field label="Gaji Pokok (Rp)" field="gajiPokok" type="number" placeholder="1000000" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">{editStaff ? "Simpan Perubahan" : "Tambah Petugas"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
