"use client";

import { useState } from "react";
import NewsCard from "@/components/NewsCard";
import type { NewsCategory, NewsItem } from "@/data/news";

type Filter = "semua" | NewsCategory;

const filters: { value: Filter; label: string }[] = [
  { value: "semua",      label: "Semua" },
  { value: "berita",     label: "Berita" },
  { value: "pengumuman", label: "Pengumuman" },
  { value: "edukasi",    label: "Edukasi" },
];

const ITEMS_PER_PAGE = 6;

export default function BeritaList({ news }: { news: NewsItem[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("semua");
  const [page, setPage] = useState(1);

  const filtered = activeFilter === "semua"
    ? news
    : news.filter((n) => n.category === activeFilter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleFilter(f: Filter) {
    setActiveFilter(f);
    setPage(1);
  }

  return (
    <section className="px-4 py-12 bg-[#FBFAF2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilter(f.value)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeFilter === f.value
                  ? "bg-[#2F855A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="px-4 text-sm text-gray-500 mb-6">
          Menampilkan <span className="font-semibold text-gray-900">{filtered.length}</span> artikel
        </p>

        {paginated.length > 0 ? (
          <div className="px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-lg font-medium">Belum ada artikel</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  page === n
                    ? "bg-[#2F855A] text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
