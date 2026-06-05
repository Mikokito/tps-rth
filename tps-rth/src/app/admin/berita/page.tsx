"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Category = "berita" | "pengumuman" | "edukasi";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  tanggal: string;
  image_url?: string;
};

const CATEGORY_LABELS: Record<Category, string> = {
  berita: "Berita", pengumuman: "Pengumuman", edukasi: "Edukasi",
};
const CATEGORY_COLORS: Record<Category, string> = {
  berita: "bg-blue-50 text-blue-700",
  pengumuman: "bg-amber-50 text-amber-700",
  edukasi: "bg-green-50 text-green-700",
};

const EMPTY_FORM = { title: "", excerpt: "", category: "berita" as Category, image_url: "" };

export default function BeritaAdminPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("berita")
      .select("id, title, excerpt, content, category, tanggal, image_url")
      .order("tanggal", { ascending: false });
    if (data) setItems(data);
  }

  function openAdd() {
    setEditItem(null); setForm(EMPTY_FORM); setFormErr({}); setShowModal(true);
  }

  function openEdit(item: NewsItem) {
    setEditItem(item);
    setForm({ title: item.title, excerpt: item.excerpt, category: item.category, image_url: item.image_url ?? "" });
    setFormErr({}); setShowModal(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image_url: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Judul wajib diisi";
    if (!form.excerpt.trim()) errs.excerpt = "Ringkasan wajib diisi";
    return errs;
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErr(errs); return; }
    setSaving(true);
    const supabase = createClient();

    if (editItem) {
      const { data } = await supabase
        .from("berita")
        .update({ title: form.title.trim(), excerpt: form.excerpt.trim(), category: form.category, image_url: form.image_url || null,
        })
        .eq("id", editItem.id)
        .select("id, title, excerpt, content, category, tanggal, image_url")
        .single();
      if (data) setItems((prev) => prev.map((item) => item.id === editItem.id ? data : item));
    } else {
      const { data } = await supabase
        .from("berita")
        .insert({
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          content: form.excerpt.trim(),
          category: form.category,
          tanggal: new Date().toISOString().slice(0, 10),
          image_url: form.image_url || null,
        })
        .select("id, title, excerpt, content, category, tanggal, image_url")
        .single();
      if (data) setItems((prev) => [data, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("berita").delete().eq("id", id);
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
        <button type="button" onClick={openAdd} className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
          <Plus className="w-4 h-4" /> Tambah Artikel
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
              {item.image_url
                ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                : <ImageIcon className="w-6 h-6 text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[item.category as Category] ?? "bg-gray-100 text-gray-600"}`}>
                  {CATEGORY_LABELS[item.category as Category] ?? item.category}
                </span>
                <span className="text-[11px] text-gray-400">{item.tanggal}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.excerpt}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
              {deleteConfirm === item.id ? (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Konfirmasi hapus"><Check className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setDeleteConfirm(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg" title="Batal"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setDeleteConfirm(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600" title="Tutup"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gambar Artikel</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#2F855A] transition-colors"
                  style={{ height: "160px" }}
                >
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
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
                {form.image_url && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: "" }))} className="mt-1.5 text-xs text-red-500 hover:underline">Hapus gambar</button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  aria-label="Kategori artikel">
                  {Object.entries(CATEGORY_LABELS).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Judul Artikel *</label>
                <input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setFormErr((er) => ({ ...er, title: "" })); }}
                  placeholder="Masukkan judul artikel"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] ${formErr.title ? "border-red-300" : "border-gray-200"}`} />
                {formErr.title && <p className="text-xs text-red-500 mt-1">{formErr.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ringkasan *</label>
                <textarea value={form.excerpt} onChange={(e) => { setForm({ ...form, excerpt: e.target.value }); setFormErr((er) => ({ ...er, excerpt: "" })); }}
                  placeholder="Ringkasan singkat artikel (2-3 kalimat)" rows={3}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none ${formErr.excerpt ? "border-red-300" : "border-gray-200"}`} />
                {formErr.excerpt && <p className="text-xs text-red-500 mt-1">{formErr.excerpt}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-60">
                  {saving ? "Menyimpan..." : editItem ? "Simpan Perubahan" : "Tambah Artikel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
