import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, Newspaper } from "lucide-react";
import { createAdminClient } from "@/utils/supabase/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category    = "berita" | "pengumuman" | "edukasi";
type DisplayMode = "full" | "fixed" | "stretch";

type TextBlock  = { type: "text";  id: string; text: string };
type ImageBlock = { type: "image"; id: string; url: string; caption: string; displayMode: DisplayMode };
type Block      = TextBlock | ImageBlock;

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string | null;
  category: Category;
  tanggal: string;
  image_url: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<Category, string> = {
  berita: "Berita", pengumuman: "Pengumuman", edukasi: "Edukasi",
};
const CAT_BADGE: Record<Category, string> = {
  berita:     "bg-blue-100 text-blue-700",
  pengumuman: "bg-amber-100 text-amber-700",
  edukasi:    "bg-[#F0FFF4] text-[#2F855A]",
};
const IMG_CLASS: Record<DisplayMode, string> = {
  full:    "w-full rounded-xl object-contain",
  fixed:   "w-64 mx-auto block rounded-xl object-contain",
  stretch: "w-full h-48 rounded-xl object-cover",
};

// Berita is managed live from the admin/manajer dashboards, so always fetch fresh data.
export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseBlocks(content: string | null): Block[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as Block[];
  } catch { /* plain text */ }
  return [{ type: "text", id: "legacy", text: content }];
}

function fmtDate(ds: string) {
  return new Date(ds + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("berita").select("title, excerpt").eq("id", id).maybeSingle();
  if (!data) return { title: "Artikel tidak ditemukan" };
  return {
    title: data.title,
    description: data.excerpt,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BeritaDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("berita")
    .select("id, title, excerpt, content, category, tanggal, image_url")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const article = data as Article;
  const blocks  = parseBlocks(article.content);
  const cat     = article.category as Category;

  return (
    <>
      {/* ── Breadcrumb bar ── */}
      <div className="bg-[#2F855A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2 text-sm">
          <Link href="/" className="text-green-200 hover:text-white transition-colors">Beranda</Link>
          <span className="text-green-400">/</span>
          <Link href="/berita" className="text-green-200 hover:text-white transition-colors">Berita</Link>
          <span className="text-green-400">/</span>
          <span className="text-white truncate max-w-xs">{article.title}</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Cover image ── */}
        {article.image_url ? (
          <div className="relative w-full aspect-16/7 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-6">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                cat === "berita" ? "bg-blue-500 text-white" :
                cat === "pengumuman" ? "bg-amber-500 text-white" :
                "bg-[#2F855A] text-white"
              }`}>
                {CAT_LABEL[cat]}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-16/7 rounded-2xl bg-gray-100 flex items-center justify-center mb-8">
            <Newspaper className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* ── Article header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {!article.image_url && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${CAT_BADGE[cat]}`}>
                {CAT_LABEL[cat]}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {fmtDate(article.tanggal)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-5">
            {article.title}
          </h1>

          {/* Excerpt as lead paragraph */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed border-l-4 border-[#2F855A] pl-5 py-1">
            {article.excerpt}
          </p>
        </div>

        {/* ── Divider ── */}
        {blocks.length > 0 && <hr className="border-gray-200 mb-8" />}

        {/* ── Content blocks ── */}
        <div className="space-y-6">
          {blocks.map((block) => {
            if (block.type === "text") {
              const paras = (block as TextBlock).text.split("\n\n").filter(Boolean);
              return paras.map((para, i) => (
                <p key={`${block.id}-${i}`}
                  className="text-base text-gray-700 leading-relaxed">
                  {para}
                </p>
              ));
            }

            const imgBlock = block as ImageBlock;
            if (imgBlock.type === "image" && imgBlock.url) {
              const imgClass = IMG_CLASS[imgBlock.displayMode ?? "full"];
              return (
                <figure key={imgBlock.id}>
                  <img src={imgBlock.url} alt={imgBlock.caption || "gambar artikel"} className={imgClass} />
                  {imgBlock.caption && (
                    <figcaption className="text-xs text-center text-gray-400 mt-2 italic">
                      {imgBlock.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return null;
          })}
        </div>

        {/* ── Footer navigation ── */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/berita"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F855A] hover:text-[#276749] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke semua berita
          </Link>
        </div>
      </main>
    </>
  );
}
