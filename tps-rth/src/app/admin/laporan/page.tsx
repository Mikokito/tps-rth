"use client";

import { useState } from "react";
import { Upload, Download, Trash2, FileText, X, Check } from "lucide-react";
import { laporanItems as initialLaporan, type LaporanItem } from "@/data/adminData";

const TIPE_COLORS: Record<string, string> = {
  PDF:  "bg-red-50 text-red-700",
  XLSX: "bg-green-50 text-green-700",
  DOCX: "bg-blue-50 text-blue-700",
};

export default function LaporanPage() {
  const [items, setItems] = useState<LaporanItem[]>(initialLaporan);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ judul: "", tipe: "PDF" as "PDF" | "XLSX" | "DOCX", fileName: "" });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toUpperCase() as "PDF" | "XLSX" | "DOCX";
    const validTypes = ["PDF", "XLSX", "DOCX"];
    setForm((f) => ({
      ...f,
      fileName: file.name,
      tipe: validTypes.includes(ext) ? ext : "PDF",
      judul: f.judul || file.name.replace(/\.[^.]+$/, ""),
    }));
  }

  function handleUpload(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.judul.trim()) errs.judul = "Judul wajib diisi";
    if (!form.fileName) errs.file = "Pilih file terlebih dahulu";
    if (Object.keys(errs).length > 0) { setFormErr(errs); return; }

    const newItem: LaporanItem = {
      id: `l-${Date.now()}`,
      judul: form.judul.trim(),
      tanggal: new Date().toISOString().slice(0, 10),
      tipe: form.tipe,
      ukuran: "—",
    };
    setItems([newItem, ...items]);
    setShowForm(false);
    setForm({ judul: "", tipe: "PDF", fileName: "" });
    setFormErr({});
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500">Arsip laporan keuangan dan operasional</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload Laporan
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul Laporan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipe</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ukuran</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-900">{item.judul}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.tanggal}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${TIPE_COLORS[item.tipe] ?? "bg-gray-100 text-gray-600"}`}>
                      {item.tipe}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{item.ukuran}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => alert(`Simulasi download: ${item.judul}`)}
                        className="p-2 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {deleteConfirm === item.id ? (
                        <>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
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
      </div>

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Upload Laporan Baru</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih File *</label>
                <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${formErr.file ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-[#2F855A] hover:bg-green-50/30"}`}>
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {form.fileName || "Klik untuk pilih file (PDF, XLSX, DOCX)"}
                  </span>
                  <input type="file" accept=".pdf,.xlsx,.docx" className="hidden" onChange={handleFileChange} />
                </label>
                {formErr.file && <p className="text-xs text-red-500 mt-1">{formErr.file}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Judul Laporan *</label>
                <input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Laporan Keuangan April 2025"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.judul ? "border-red-300" : "border-gray-200"}`}
                />
                {formErr.judul && <p className="text-xs text-red-500 mt-1">{formErr.judul}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}