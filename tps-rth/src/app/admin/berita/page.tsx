"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, ImageIcon } from "lucide-react";
import { newsData as initialNews, type NewsItem } from "@/data/news";

type Category = "berita" | "pengumuman" | "edukasi";

const CATEGORY_LABELS: Record<Category, string> = {
  berita: "Berita", pengumuman: "Pengumuman", edukasi: "Edukasi",
};
const CATEGORY_COLORS: Record<Category, string> = {
  berita: "bg-blue-50 text-blue-700",
  pengumuman: "bg-amber-50 text-amber-700",
  edukasi: "bg-green-50 text-green-700",
};

const EMPTY_FORM = { title: "", excerpt: "", category: "berita" as Category, imageUrl: "" };

export default function BeritaAdminPage() {
  const [items, setItems] = useState<NewsItem[]>(initialNews);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditItem(null); setForm(EMPTY_FORM); setFormErr({}); setShowModal(true);
  }
  function openEdit(item: NewsItem) {
    setEditItem(item);
    setForm({ title: item.title, excerpt: item.excerpt, category: item.category as Category, imageUrl: item.imageUrl ?? "" });
    setFormErr({}); setShowModal(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Judul wajib diisi";
    if (!form.excerpt.trim()) errs.excerpt = "Ringkasan wajib diisi";
    return errs;
  }

  function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErr(errs); return; }

    if (editItem) {
      setItems((prev) => prev.map((item) =>
        item.id === editItem.id
          ? { ...item, title: form.title, excerpt: form.excerpt, category: form.category, imageUrl: form.imageUrl || undefined }
          : item
      ));
    } else {
      setItems([{
        id: Date.now(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.excerpt.trim(),
        category: form.category,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        bgColor: "bg-gray-100",
        emoji: "",
        imageUrl: form.imageUrl || undefined,
      }, ...items]);
    }
    setShowModal(false);
  }

  function handleDelete(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-sm text-gray-500">{items.length} artikel tersedia</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
          <Plus className="w-4 h-4" /> Tambah Artikel
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                : <ImageIcon className="w-6 h-6 text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[item.category as Category] ?? "bg-gray-100 text-gray-600"}`}>
                  {CATEGORY_LABELS[item.category as Category] ?? item.category}
                </span>
                <span className="text-[11px] text-gray-400">{item.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.excerpt}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
              {deleteConfirm === item.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editItem ? "Edit Artikel" : "Tambah Artikel Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gambar Artikel</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#2F855A] transition-colors"
                  style={{ height: "160px" }}
                >
                  {form.imageUrl ? (
                    <>
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-semibold">Ganti Gambar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-sm">Klik untuk upload gambar</span>
                      <span className="text-xs">JPG, PNG, WEBP — maks. 5 MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                {form.imageUrl && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className="mt-1.5 text-xs text-red-500 hover:underline">Hapus gambar</button>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
                  {Object.entries(CATEGORY_LABELS).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Judul Artikel *</label>
                <input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setFormErr((er) => ({ ...er, title: undefined as unknown as string })); }}
                  placeholder="Masukkan judul artikel"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.title ? "border-red-300" : "border-gray-200"}`} />
                {formErr.title && <p className="text-xs text-red-500 mt-1">{formErr.title}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ringkasan *</label>
                <textarea value={form.excerpt} onChange={(e) => { setForm({ ...form, excerpt: e.target.value }); setFormErr((er) => ({ ...er, excerpt: undefined as unknown as string })); }}
                  placeholder="Ringkasan singkat artikel (2-3 kalimat)" rows={3}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none ${formErr.excerpt ? "border-red-300" : "border-gray-200"}`} />
                {formErr.excerpt && <p className="text-xs text-red-500 mt-1">{formErr.excerpt}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">
                  {editItem ? "Simpan Perubahan" : "Tambah Artikel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}