"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type WasteEntry = {
  id: string;
  tanggal: string;
  petugas_nama: string;
  jenis_sampah: string;
  berat_kg: number;
  catatan: string;
  created_at: string;
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const JENIS_COLOR_KEYS: [string, string][] = [
  ["Plastik",   "bg-blue-100 text-blue-700"],
  ["Kardus",    "bg-amber-100 text-amber-700"],
  ["Kertas",    "bg-amber-100 text-amber-700"],
  ["Koran",     "bg-amber-100 text-amber-700"],
  ["Aluminium", "bg-violet-100 text-violet-700"],
  ["Besi",      "bg-slate-100 text-slate-700"],
  ["Tembaga",   "bg-orange-100 text-orange-700"],
  ["Logam",     "bg-slate-100 text-slate-700"],
  ["Organik",   "bg-green-100 text-green-700"],
  ["Kaca",      "bg-cyan-100 text-cyan-700"],
];

function jenisColor(jenis: string): string {
  const l = jenis.toLowerCase();
  for (const [key, cls] of JENIS_COLOR_KEYS) {
    if (l.includes(key.toLowerCase())) return cls;
  }
  return "bg-gray-100 text-gray-700";
}

function JenisBadge({ jenis }: { jenis: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${jenisColor(jenis)}`}>
      {jenis}
    </span>
  );
}

export default function AdminSampahPage() {
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterTanggal, setFilterTanggal] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("waste_entries")
      .select("id, tanggal, petugas_nama, jenis_sampah, berat_kg, catatan, created_at")
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
    setReady(true);
  }

  const uniqueJenis = useMemo(() => {
    const set = new Set(entries.map((e) => e.jenis_sampah));
    return ["Semua", ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch = !search || e.petugas_nama.toLowerCase().includes(search.toLowerCase());
      const matchJenis  = filterJenis === "Semua" || e.jenis_sampah === filterJenis;
      const matchDate   = !filterTanggal || e.tanggal === filterTanggal;
      return matchSearch && matchJenis && matchDate;
    });
  }, [entries, search, filterJenis, filterTanggal]);

  const summaryByJenis = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.jenis_sampah] = (map[e.jenis_sampah] || 0) + e.berat_kg; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const totalKg = filtered.reduce((s, e) => s + e.berat_kg, 0);
  const hasFilters = !!(search || filterJenis !== "Semua" || filterTanggal);

  if (!ready) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Data Sampah Masuk</h1>
        <p className="text-sm text-gray-500">Data input dari petugas lapangan</p>
      </div>

      {/* Ringkasan per jenis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Ringkasan Per Jenis</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filterTanggal ? `Tanggal: ${fmtDate(filterTanggal)}` : hasFilters ? "Berdasarkan filter aktif" : "Semua data"}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Total berat: <span className="font-bold text-gray-800">{totalKg.toFixed(1)} kg</span>
          </div>
        </div>
        {summaryByJenis.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">Tidak ada data.</p>
        ) : (
          <div className="px-5 py-3 flex flex-wrap gap-3">
            {summaryByJenis.map(([jenis, kg]) => (
              <div key={jenis} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <JenisBadge jenis={jenis} />
                <span className="text-xs font-bold text-gray-700">{kg.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cari Petugas</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama petugas..."
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
            </div>
          </div>
          <div className="min-w-44">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis Sampah</label>
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} aria-label="Filter jenis sampah"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
              {uniqueJenis.map((j) => <option key={j}>{j}</option>)}
            </select>
          </div>
          <div className="min-w-44">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal</label>
            <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} title="Filter tanggal"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
          </div>
          {hasFilters && (
            <button type="button"
              onClick={() => { setSearch(""); setFilterJenis("Semua"); setFilterTanggal(""); }}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors self-end"
            >
              <X className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-[#2F855A]" />
          <h2 className="text-sm font-semibold text-gray-800">Daftar Setoran</h2>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} entri</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Petugas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis Sampah</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Berat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                  {hasFilters ? "Tidak ada data sesuai filter." : "Belum ada data sampah."}
                </td></tr>
              ) : filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{entry.tanggal}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{entry.petugas_nama}</td>
                  <td className="px-4 py-3.5"><JenisBadge jenis={entry.jenis_sampah} /></td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">{entry.berat_kg} kg</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 max-w-48">{entry.catatan || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">
              {hasFilters ? "Tidak ada data sesuai filter." : "Belum ada data sampah."}
            </p>
          ) : filtered.map((entry) => (
            <div key={entry.id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{entry.petugas_nama}</p>
                  <p className="text-xs text-gray-400">{entry.tanggal}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">{entry.berat_kg} kg</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <JenisBadge jenis={entry.jenis_sampah} />
                {entry.catatan && <span className="text-xs text-gray-400">· {entry.catatan}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
