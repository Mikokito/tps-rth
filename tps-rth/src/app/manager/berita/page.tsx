"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, X, Check, ImageIcon,
  ArrowLeft, Calendar, FileText, Type, Eye,
  Tag, MoveUp, MoveDown,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "berita" | "pengumuman" | "edukasi";

type DisplayMode = "full" | "fixed" | "stretch";

type TextBlock  = { type: "text";  id: string; text: string };
type ImageBlock = { type: "image"; id: string; url: string; caption: string; displayMode: DisplayMode };
type Block      = TextBlock | ImageBlock;

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  tanggal: string;
  image_url?: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<Category, string> = {
  berita: "Berita", pengumuman: "Pengumuman", edukasi: "Edukasi",
};
const CAT_COLOR: Record<Category, string> = {
  berita:     "bg-blue-100 text-blue-700",
  pengumuman: "bg-amber-100 text-amber-700",
  edukasi:    "bg-green-100 text-green-700",
};
const CAT_BADGE: Record<Category, string> = {
  berita:     "bg-blue-500",
  pengumuman: "bg-amber-500",
  edukasi:    "bg-[#2F855A]",
};

const EMPTY_META = { title: "", excerpt: "", category: "berita" as Category, image_url: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISPLAY_MODES: { value: DisplayMode; label: string; desc: string }[] = [
  { value: "full",    label: "Penuh",   desc: "Lebar penuh, tinggi proporsional" },
  { value: "fixed",   label: "Tetap",   desc: "Dipusatkan, lebar terbatas" },
  { value: "stretch", label: "Melebar", desc: "Lebar penuh, tinggi tetap (banner)" },
];

const DISPLAY_IMG_CLASS: Record<DisplayMode, string> = {
  full:    "w-full rounded-xl object-contain",
  fixed:   "w-64 mx-auto block rounded-xl object-contain",
  stretch: "w-full h-48 rounded-xl object-cover",
};

// Kompresi canvas — binary search kualitas sampai ≤ maxKB
async function compressImage(file: File, maxKB: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const MAX_DIM = 1920;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const r = Math.min(MAX_DIM / width, MAX_DIM / height);
        width  = Math.round(width  * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      let lo = 0.1, hi = 0.95, best = "";
      for (let i = 0; i < 10; i++) {
        const mid  = (lo + hi) / 2;
        const data = canvas.toDataURL("image/jpeg", mid);
        const kb   = Math.round((data.length * 3) / 4 / 1024);
        if (kb <= maxKB) { best = data; lo = mid; }
        else { hi = mid; }
      }
      resolve(best || canvas.toDataURL("image/jpeg", 0.1));
    };
    img.src = blobUrl;
  });
}

function genId() { return Math.random().toString(36).slice(2, 9); }

function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

function parseBlocks(content: string): Block[] {
  if (!content) return [{ type: "text", id: genId(), text: "" }];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Backward compat: tambahkan displayMode default ke blok lama
      return (parsed as Block[]).map((b) =>
        b.type === "image" && !(b as ImageBlock).displayMode
          ? { ...b, displayMode: "full" as DisplayMode }
          : b
      );
    }
  } catch { /* legacy plain text */ }
  return [{ type: "text", id: genId(), text: content }];
}

function fmtDate(ds: string) {
  return new Date(ds + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function renderBlocks(blocks: Block[]) {
  return blocks.map((block) => {
    if (block.type === "text") {
      const paras = block.text.split("\n\n").filter(Boolean);
      if (paras.length === 0) return null;
      return paras.map((p, i) => (
        <p key={`${block.id}-${i}`} className="text-sm text-gray-700 leading-relaxed">{p}</p>
      ));
    }
    if (block.type === "image" && block.url) {
      const imgClass = DISPLAY_IMG_CLASS[(block as ImageBlock).displayMode ?? "full"];
      return (
        <figure key={block.id} className="my-1">
          <img src={block.url} alt={block.caption || "gambar artikel"} className={imgClass} />
          {block.caption && (
            <figcaption className="text-xs text-center text-gray-400 mt-1.5 italic">{block.caption}</figcaption>
          )}
        </figure>
      );
    }
    return null;
  });
}

function ArticlePreview({ meta, blocks, today }: {
  meta: typeof EMPTY_META;
  blocks: Block[];
  today: string;
}) {
  const hasTitle   = meta.title.trim().length > 0;
  const hasExcerpt = meta.excerpt.trim().length > 0;
  const hasImage   = !!meta.image_url;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Hero image */}
      <div className="relative w-full bg-gray-100 aspect-16/7">
        {hasImage ? (
          <img src={meta.image_url} alt="hero" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon className="w-10 h-10" />
            <span className="text-sm">Gambar sampul belum dipilih</span>
          </div>
        )}
        {hasImage && <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />}
        {hasImage && (
          <div className="absolute bottom-4 left-4">
            <span className={`${CAT_BADGE[meta.category]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
              {CAT_LABEL[meta.category]}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        {!hasImage && (
          <div className="flex items-center gap-2">
            <span className={`${CAT_COLOR[meta.category]} text-xs font-bold px-2.5 py-0.5 rounded-full`}>
              {CAT_LABEL[meta.category]}
            </span>
            <span className="text-xs text-gray-400">{fmtDate(today)}</span>
          </div>
        )}
        {hasImage && <p className="text-xs text-gray-400">{fmtDate(today)}</p>}

        <h1 className={`font-bold leading-snug text-xl ${hasTitle ? "text-gray-900" : "text-gray-300 italic"}`}>
          {hasTitle ? meta.title : "Judul artikel akan muncul di sini..."}
        </h1>

        {(hasExcerpt || true) && (
          <p className={`text-base leading-relaxed border-l-4 pl-4 ${
            hasExcerpt ? "text-gray-600 border-[#2F855A]" : "text-gray-300 border-gray-200 italic text-sm"
          }`}>
            {hasExcerpt ? meta.excerpt : "Ringkasan artikel akan muncul di sini..."}
          </p>
        )}

        {(hasExcerpt || blocks.some((b) => b.type === "text" && (b as TextBlock).text.trim())) && (
          <hr className="border-gray-100" />
        )}

        <div className="space-y-4">
          {renderBlocks(blocks)}
          {blocks.every((b) => b.type === "text" && !(b as TextBlock).text.trim()) && (
            <p className="text-sm text-gray-300 italic">Isi artikel akan ditampilkan di sini...</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add-block divider ────────────────────────────────────────────────────────

function AddBlockDivider({ onAddText, onAddImage }: {
  onAddText: () => void;
  onAddImage: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2 py-1.5">
      <div className="flex-1 h-px bg-gray-200" />
      {open ? (
        <div className="flex items-center gap-1 shrink-0">
          <button type="button"
            onClick={() => { onAddText(); setOpen(false); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-[#2F855A] hover:text-[#2F855A] transition-colors shadow-sm">
            <Type className="w-3.5 h-3.5" /> Paragraf
          </button>
          <button type="button"
            onClick={() => { onAddImage(); setOpen(false); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-500 transition-colors shadow-sm">
            <ImageIcon className="w-3.5 h-3.5" /> Gambar
          </button>
          <button type="button" title="Batal" onClick={() => setOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" title="Tambah blok" onClick={() => setOpen(true)}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full hover:text-[#2F855A] hover:border-[#2F855A] transition-colors shadow-sm">
          <Plus className="w-3 h-3" /> Tambah
        </button>
      )}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── Editor Panel (tab: Tulis / Preview) ─────────────────────────────────────

type EditorPanelProps = {
  today: string;
  editItem: NewsItem | null;
  meta: typeof EMPTY_META; setMeta: React.Dispatch<React.SetStateAction<typeof EMPTY_META>>;
  blocks: Block[];         setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  metaErr: Record<string, string>; setMetaErr: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saving: boolean;
  coverRef: React.RefObject<HTMLInputElement | null>;
  blockImgRef: React.RefObject<HTMLInputElement | null>;
  activeBlockId: React.MutableRefObject<string | null>;
  onBack: () => void; onSave: () => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlockImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addBlock: (idx: number, type: "text" | "image") => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, dir: -1 | 1) => void;
  updateText: (id: string, text: string) => void;
  updateCaption: (id: string, caption: string) => void;
  updateDisplayMode: (id: string, dm: DisplayMode) => void;
};

function EditorPanel({
  today, editItem, meta, setMeta, blocks, metaErr, setMetaErr, saving,
  coverRef, blockImgRef, activeBlockId,
  onBack, onSave, onCoverChange, onBlockImageChange,
  addBlock, removeBlock, moveBlock, updateText, updateCaption, updateDisplayMode,
}: EditorPanelProps) {
  const [tab, setTab] = useState<"tulis" | "preview">("tulis");

  function triggerBlockImage(blockId: string) {
    activeBlockId.current = blockId;
    blockImgRef.current?.click();
  }

  return (
    <div className="space-y-4">
      <input ref={coverRef}    type="file" accept="image/*" className="hidden" aria-label="Upload gambar sampul" onChange={onCoverChange} />
      <input ref={blockImgRef} type="file" accept="image/*" className="hidden" aria-label="Upload gambar blok" onChange={onBlockImageChange} />

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
            Batal
          </button>
          <button type="button" onClick={onSave} disabled={saving}
            className="px-5 py-2 bg-[#2F855A] text-white text-sm font-semibold rounded-xl hover:bg-[#276749] disabled:opacity-60">
            {saving ? "Menyimpan..." : editItem ? "Simpan Perubahan" : "Publikasikan"}
          </button>
        </div>
      </div>

      {/* ── Single panel with tabs ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tab header */}
        <div className="flex items-center gap-0 border-b border-gray-100 bg-gray-50/60 px-4">
          <button
            type="button"
            onClick={() => setTab("tulis")}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "tulis"
                ? "border-[#2F855A] text-[#2F855A]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" /> Tulis
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "preview"
                ? "border-[#2F855A] text-[#2F855A]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>

        {/* ── Tulis tab ── */}
        {tab === "tulis" && (
          <div className="p-5 space-y-5">

            {/* Cover image */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gambar Sampul</label>
              <div
                onClick={() => coverRef.current?.click()}
                className={`relative rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors h-35 ${
                  meta.image_url ? "border-transparent" : "border-gray-200 hover:border-[#2F855A]"
                }`}
              >
                {meta.image_url ? (
                  <>
                    <img src={meta.image_url} alt="sampul" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full">Ganti Gambar</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1.5 text-gray-400">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-sm font-medium">Klik untuk upload gambar sampul</span>
                    <span className="text-xs text-gray-300">JPG, PNG, WEBP · Maks 150 KB setelah kompresi</span>
                  </div>
                )}
              </div>
              {meta.image_url && (
                <button type="button" onClick={() => setMeta((m) => ({ ...m, image_url: "" }))}
                  className="mt-1 text-xs text-red-400 hover:text-red-600 hover:underline">
                  Hapus gambar sampul
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <Tag className="w-3 h-3 inline mr-1" />Kategori
              </label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(CAT_LABEL) as Category[]).map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => setMeta((m) => ({ ...m, category: cat }))}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      meta.category === cat
                        ? `${CAT_COLOR[cat]} border-transparent`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}>
                    {CAT_LABEL[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Artikel *</label>
              <textarea
                value={meta.title}
                onChange={(e) => { setMeta((m) => ({ ...m, title: e.target.value })); setMetaErr((er) => ({ ...er, title: "" })); }}
                placeholder="Tulis judul artikel..."
                rows={2}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none leading-snug ${
                  metaErr.title ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {metaErr.title && <p className="text-xs text-red-500 mt-1">{metaErr.title}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ringkasan *</label>
              <textarea
                value={meta.excerpt}
                onChange={(e) => { setMeta((m) => ({ ...m, excerpt: e.target.value })); setMetaErr((er) => ({ ...er, excerpt: "" })); }}
                placeholder="Ringkasan singkat artikel (2–3 kalimat)..."
                rows={3}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none ${
                  metaErr.excerpt ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {metaErr.excerpt && <p className="text-xs text-red-500 mt-1">{metaErr.excerpt}</p>}
            </div>

            {/* ── Block editor ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Isi Artikel *</label>
              {metaErr.content && <p className="text-xs text-red-500 mb-2">{metaErr.content}</p>}

              <div className="space-y-0">
                {blocks.map((block, idx) => (
                  <div key={block.id}>

                    {/* Text block */}
                    {block.type === "text" && (
                      <div className="relative group/block">
                        <textarea
                          value={(block as TextBlock).text}
                          onChange={(e) => updateText(block.id, e.target.value)}
                          placeholder={idx === 0 ? "Tulis paragraf pertama di sini...\n\nGunakan baris kosong untuk paragraf baru." : "Tulis paragraf..."}
                          rows={4}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none leading-relaxed"
                        />
                        <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button type="button" onClick={() => moveBlock(block.id, -1)} title="Pindah ke atas"
                              className="p-1 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 shadow-sm">
                              <MoveUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < blocks.length - 1 && (
                            <button type="button" onClick={() => moveBlock(block.id, 1)} title="Pindah ke bawah"
                              className="p-1 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 shadow-sm">
                              <MoveDown className="w-3 h-3" />
                            </button>
                          )}
                          {blocks.length > 1 && (
                            <button type="button" onClick={() => removeBlock(block.id)} title="Hapus blok"
                              className="p-1 bg-white border border-red-100 rounded-lg text-red-400 hover:text-red-600 shadow-sm">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image block */}
                    {block.type === "image" && (
                      <div className="group/block relative border border-gray-200 rounded-xl overflow-hidden">
                        {(block as ImageBlock).url ? (
                          <div className="relative">
                            <img src={(block as ImageBlock).url} alt="blok gambar" className="w-full object-cover max-h-64" />
                            <button type="button"
                              onClick={() => triggerBlockImage(block.id)}
                              className="absolute top-2 left-2 text-xs font-semibold text-white bg-black/50 hover:bg-black/70 px-2.5 py-1 rounded-full transition-colors">
                              Ganti
                            </button>
                          </div>
                        ) : (
                          <button type="button"
                            onClick={() => triggerBlockImage(block.id)}
                            className="w-full flex flex-col items-center justify-center gap-2 py-8 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 transition-colors">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-sm font-medium">Klik untuk upload gambar</span>
                          </button>
                        )}
                        <div className="px-3 pt-2.5 pb-1 bg-gray-50 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Tampilan</p>
                          <div className="flex gap-1.5 flex-wrap mb-2">
                            {DISPLAY_MODES.map((m) => {
                              const active = (block as ImageBlock).displayMode === m.value;
                              return (
                                <button key={m.value} type="button"
                                  onClick={() => updateDisplayMode(block.id, m.value)}
                                  title={m.desc}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                    active
                                      ? "bg-[#2F855A] text-white border-[#2F855A]"
                                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                                  }`}>
                                  {m.label}
                                </button>
                              );
                            })}
                            <span className="text-[10px] text-gray-400 self-center ml-1">
                              {DISPLAY_MODES.find((m) => m.value === (block as ImageBlock).displayMode)?.desc}
                            </span>
                          </div>
                        </div>
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                          <input
                            value={(block as ImageBlock).caption}
                            onChange={(e) => updateCaption(block.id, e.target.value)}
                            placeholder="Keterangan gambar (opsional)..."
                            className="w-full text-xs bg-transparent focus:outline-none text-gray-500 placeholder:text-gray-300"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button type="button" onClick={() => moveBlock(block.id, -1)} title="Pindah ke atas"
                              className="p-1 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 shadow-sm">
                              <MoveUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < blocks.length - 1 && (
                            <button type="button" onClick={() => moveBlock(block.id, 1)} title="Pindah ke bawah"
                              className="p-1 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 shadow-sm">
                              <MoveDown className="w-3 h-3" />
                            </button>
                          )}
                          <button type="button" onClick={() => removeBlock(block.id)} title="Hapus blok"
                            className="p-1 bg-white border border-red-100 rounded-lg text-red-400 hover:text-red-600 shadow-sm">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <AddBlockDivider
                      onAddText={() => addBlock(idx, "text")}
                      onAddImage={() => addBlock(idx, "image")}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Preview tab ── */}
        {tab === "preview" && (
          <ArticlePreview meta={meta} blocks={blocks} today={today} />
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BeritaManagerPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [items,         setItems]         = useState<NewsItem[]>([]);
  const [mode,          setMode]          = useState<"list" | "editor">("list");
  const [editItem,      setEditItem]      = useState<NewsItem | null>(null);
  const [meta,          setMeta]          = useState({ ...EMPTY_META });
  const [blocks,        setBlocks]        = useState<Block[]>([{ type: "text", id: genId(), text: "" }]);
  const [metaErr,       setMetaErr]       = useState<Record<string, string>>({});
  const [saving,        setSaving]        = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const coverRef      = useRef<HTMLInputElement>(null);
  const blockImgRef   = useRef<HTMLInputElement>(null);
  const activeBlockId = useRef<string | null>(null);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const supabase = createClient();
    const { data } = await supabase
      .from("berita")
      .select("id, title, excerpt, content, category, tanggal, image_url")
      .order("tanggal", { ascending: false });
    if (data) setItems(data as NewsItem[]);
  }

  function openAdd() {
    setEditItem(null);
    setMeta({ ...EMPTY_META });
    setBlocks([{ type: "text", id: genId(), text: "" }]);
    setMetaErr({});
    setMode("editor");
  }

  function openEdit(item: NewsItem) {
    setEditItem(item);
    setMeta({ title: item.title, excerpt: item.excerpt, category: item.category, image_url: item.image_url ?? "" });
    setBlocks(parseBlocks(item.content ?? ""));
    setMetaErr({});
    setMode("editor");
  }

  // ── Cover image (compress ≤150KB) ──
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 150);
    setMeta((m) => ({ ...m, image_url: compressed }));
  }

  // ── Block image (compress ≤300KB) ──
  function triggerBlockImage(blockId: string) {
    activeBlockId.current = blockId;
    blockImgRef.current?.click();
  }

  async function handleBlockImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id   = activeBlockId.current;
    if (!file || !id) return;
    const compressed = await compressImage(file, 300);
    setBlocks((prev) => prev.map((b) =>
      b.id === id && b.type === "image" ? { ...b, url: compressed } : b
    ));
    e.target.value = "";
  }

  // ── Block CRUD ──
  function addBlock(afterIndex: number, type: "text" | "image") {
    const newBlock: Block = type === "text"
      ? { type: "text",  id: genId(), text: "" }
      : { type: "image", id: genId(), url: "", caption: "", displayMode: "full" as DisplayMode };
    setBlocks((prev) => [
      ...prev.slice(0, afterIndex + 1),
      newBlock,
      ...prev.slice(afterIndex + 1),
    ]);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.length <= 1 ? prev : prev.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function updateText(id: string, text: string) {
    setBlocks((prev) => prev.map((b) => b.id === id && b.type === "text" ? { ...b, text } : b));
  }

  function updateCaption(id: string, caption: string) {
    setBlocks((prev) => prev.map((b) => b.id === id && b.type === "image" ? { ...b, caption } : b));
  }

  function updateDisplayMode(id: string, displayMode: DisplayMode) {
    setBlocks((prev) => prev.map((b) => b.id === id && b.type === "image" ? { ...b, displayMode } : b));
  }

  // ── Save ──
  function validate() {
    const errs: Record<string, string> = {};
    if (!meta.title.trim())   errs.title   = "Judul wajib diisi";
    if (!meta.excerpt.trim()) errs.excerpt  = "Ringkasan wajib diisi";
    const hasText = blocks.some((b) => b.type === "text" && (b as TextBlock).text.trim());
    if (!hasText) errs.content = "Isi artikel wajib ada minimal satu paragraf";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setMetaErr(errs); return; }
    setSaving(true);
    const supabase  = createClient();
    const content   = serializeBlocks(blocks);
    const payload   = {
      title:     meta.title.trim(),
      excerpt:   meta.excerpt.trim(),
      content,
      category:  meta.category,
      image_url: meta.image_url || null,
    };

    if (editItem) {
      const { data } = await supabase.from("berita")
        .update(payload).eq("id", editItem.id)
        .select("id, title, excerpt, content, category, tanggal, image_url").single();
      if (data) setItems((prev) => prev.map((it) => it.id === editItem.id ? data as NewsItem : it));
    } else {
      const { data } = await supabase.from("berita")
        .insert({ ...payload, tanggal: today })
        .select("id, title, excerpt, content, category, tanggal, image_url").single();
      if (data) setItems((prev) => [data as NewsItem, ...prev]);
    }
    setSaving(false);
    setMode("list");
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("berita").delete().eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setDeleteConfirm(null);
  }

  // ── Editor view ───────────────────────────────────────────────────────────
  if (mode === "editor") {
    return (
      <EditorPanel
        today={today}
        editItem={editItem}
        meta={meta} setMeta={setMeta}
        blocks={blocks} setBlocks={setBlocks}
        metaErr={metaErr} setMetaErr={setMetaErr}
        saving={saving}
        coverRef={coverRef} blockImgRef={blockImgRef} activeBlockId={activeBlockId}
        onBack={() => setMode("list")}
        onSave={handleSave}
        onCoverChange={handleCoverChange}
        onBlockImageChange={handleBlockImageChange}
        addBlock={addBlock} removeBlock={removeBlock} moveBlock={moveBlock}
        updateText={updateText} updateCaption={updateCaption} updateDisplayMode={updateDisplayMode}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-sm text-gray-500">{items.length} artikel tersedia</p>
        </div>
        <button type="button" onClick={openAdd}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#276749] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Artikel
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 flex flex-col items-center gap-3 text-gray-400">
          <FileText className="w-10 h-10 opacity-30" />
          <p className="text-sm">Belum ada artikel</p>
          <button type="button" onClick={openAdd}
            className="text-xs text-[#2F855A] font-semibold hover:underline">
            + Tambah artikel pertama
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative w-full bg-gray-100 aspect-video">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
                }
                <div className="absolute top-2.5 left-2.5">
                  <span className={`${CAT_COLOR[item.category as Category] ?? "bg-gray-100 text-gray-600"} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                    {CAT_LABEL[item.category as Category] ?? item.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1.5">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(item.tanggal)}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.excerpt}</p>
              </div>
              <div className="px-4 pb-3 flex items-center justify-end gap-1 border-t border-gray-50 pt-2">
                <button type="button" onClick={() => openEdit(item)} title="Edit artikel"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#2F855A] font-medium px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                {deleteConfirm === item.id ? (
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleDelete(item.id)} title="Konfirmasi hapus"
                      className="flex items-center gap-1 text-xs text-red-500 font-semibold px-2 py-1.5 rounded-lg hover:bg-red-50">
                      <Check className="w-3.5 h-3.5" /> Hapus
                    </button>
                    <button type="button" onClick={() => setDeleteConfirm(null)} title="Batal"
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setDeleteConfirm(item.id)} title="Hapus artikel"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
