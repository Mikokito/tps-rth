import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { NewsItem } from "@/data/news";

const categoryConfig: Record<string, { label: string; className: string }> = {
  berita: { label: "Berita", className: "bg-blue-100 text-blue-700" },
  pengumuman: { label: "Pengumuman", className: "bg-amber-100 text-amber-700" },
  edukasi: { label: "Edukasi", className: "bg-[#F0FFF4] text-[#2F855A]" },
};

interface Props {
  news: NewsItem;
}

export default function NewsCard({ news }: Props) {
  const cat = categoryConfig[news.category];

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className={`h-44 ${news.bgColor} flex items-center justify-center text-5xl`}>
        {news.emoji}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.className}`}>
            {cat.label}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {news.date}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 leading-snug line-clamp-2">{news.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{news.excerpt}</p>

        <Link
          href={`/berita/${news.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F855A] hover:text-[#276749] transition-colors"
        >
          Baca selengkapnya
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
