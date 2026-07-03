import Link from "next/link";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import type { NewsItem } from "@/data/news";

const categoryConfig: Record<string, { label: string; badge: string; thumb: string }> = {
  berita:     { label: "Berita",      badge: "bg-blue-100 text-blue-700",   thumb: "bg-blue-50"   },
  pengumuman: { label: "Pengumuman",  badge: "bg-amber-100 text-amber-700", thumb: "bg-amber-50"  },
  edukasi:    { label: "Edukasi",     badge: "bg-[#F0FFF4] text-[#2F855A]", thumb: "bg-[#F0FFF4]" },
};

interface Props {
  news: NewsItem;
}

export default function NewsCard({ news }: Props) {
  const cat = categoryConfig[news.category] ?? categoryConfig.berita;

  return (
    <Link
      href={`/berita/${news.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#2F855A]/30 overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`h-44 flex items-center justify-center overflow-hidden ${news.image_url ? "" : cat.thumb}`}>
        {news.image_url ? (
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Newspaper className="w-12 h-12 text-gray-300" />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.badge}`}>
            {cat.label}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {news.tanggal}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#2F855A] transition-colors">
          {news.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{news.excerpt}</p>

        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F855A] group-hover:gap-2 transition-all">
          Baca selengkapnya
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
