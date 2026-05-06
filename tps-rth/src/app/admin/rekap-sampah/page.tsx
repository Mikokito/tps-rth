"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarDays, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  SAMPAH_STORAGE_KEY,
  seedSampahEntries,
  type PetugasWasteEntry,
} from "@/data/adminData";

function fmtDateLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Badge color
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
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${jenisColor(jenis)}`}>
      {jenis}
    </span>
  );
}

// --- Page ---
export default function RekapSampahPage() {
  const [entries, setEntries] = useState<PetugasWasteEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SAMPAH_STORAGE_KEY);
    const existing: PetugasWasteEntry[] = raw ? JSON.parse(raw) : [];
    if (existing.length === 0) {
      localStorage.setItem(SAMPAH_STORAGE_KEY, JSON.stringify(seedSampahEntries));
      setEntries(seedSampahEntries);
    } else {
      setEntries(existing);
    }
    setReady(true);
  }, []);

  // Group: date → jenis → total kg
  const byDate = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    entries.forEach((e) => {
      if (!map[e.tanggal]) map[e.tanggal] = {};
      map[e.tanggal][e.jenisSampah] = (map[e.tanggal][e.jenisSampah] || 0) + e.beratKg;
    });
    return map;
  }, [entries]);

  // All unique dates descending
  const dates = useMemo(
    () => Object.keys(byDate).sort((a, b) => b.localeCompare(a)),
    [byDate]
  );

  // All unique jenis (for table column headers)
  const allJenis = useMemo(() => {
    const set = new Set(entries.map((e) => e.jenisSampah));
    return Array.from(set).sort();
  }, [entries]);

  // Active date (selected or most recent)
  const activeDate = selectedDate && byDate[selectedDate] ? selectedDate : dates[0] ?? "";

  // Chart data for active date
  const chartData = useMemo(() => {
    if (!activeDate || !byDate[activeDate]) return [];
    return Object.entries(byDate[activeDate])
      .map(([jenis, kg]) => ({ jenis, kg }))
      .sort((a, b) => b.kg - a.kg);
  }, [activeDate, byDate]);

  // Summary for active date
  const activeTotalKg = chartData.reduce((s, e) => s + e.kg, 0);
  const grandTotalKg  = entries.reduce((s, e) => s + e.beratKg, 0);

  if (!ready) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400 text-sm">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rekap History Sampah</h1>
          <p className="text-sm text-gray-500">Total sampah per jenis per hari dari input petugas</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">Total Keseluruhan</p>
          <p className="text-base font-bold text-gray-900">{grandTotalKg.toFixed(1)} kg</p>
        </div>
      </div>

      {/* Detail tanggal terpilih */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#2F855A]" />
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {activeDate ? `Total Per Jenis — ${activeDate}` : "Pilih Tanggal"}
              </h2>
              {activeDate && (
                <p className="text-xs text-gray-400">{fmtDateLabel(activeDate)}</p>
              )}
            </div>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
          />
        </div>

        {chartData.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            {selectedDate ? `Tidak ada data untuk tanggal ${selectedDate}.` : "Belum ada data."}
          </p>
        ) : (
          <div className="p-5 space-y-5">
            {/* Summary badges */}
            <div className="flex flex-wrap gap-3 items-center">
              {chartData.map(({ jenis, kg }) => (
                <div key={jenis} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <JenisBadge jenis={jenis} />
                  <span className="text-sm font-bold text-gray-800">{kg.toFixed(1)} kg</span>
                </div>
              ))}
              <div className="flex items-center gap-2 bg-[#2F855A]/5 border border-[#2F855A]/20 rounded-lg px-3 py-2 ml-auto">
                <span className="text-xs font-semibold text-[#2F855A]">Total hari ini</span>
                <span className="text-sm font-bold text-[#2F855A]">{activeTotalKg.toFixed(1)} kg</span>
              </div>
            </div>

            {/* Horizontal bar chart */}
            <ResponsiveContainer width="100%" height={Math.max(140, chartData.length * 36)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v} kg`}
                />
                <YAxis
                  type="category"
                  dataKey="jenis"
                  tick={{ fontSize: 11, fill: "#374151" }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(v) => [`${v} kg`, "Berat"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="kg" radius={[0, 4, 4, 0]} fill="#2F855A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* History table — all dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#2F855A]" />
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Riwayat Semua Hari</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Klik baris untuk melihat detail — {dates.length} hari tercatat
            </p>
          </div>
        </div>

        {dates.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">Belum ada data.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Tanggal
                    </th>
                    {allJenis.map((j) => (
                      <th
                        key={j}
                        className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {j}
                      </th>
                    ))}
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Total (kg)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dates.map((date) => {
                    const dayData  = byDate[date];
                    const dayTotal = Object.values(dayData).reduce((s, v) => s + v, 0);
                    const isActive = date === activeDate;
                    return (
                      <tr
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`cursor-pointer transition-colors ${
                          isActive
                            ? "bg-green-50 hover:bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-5 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">
                          <span className={isActive ? "text-[#2F855A] font-semibold" : ""}>
                            {date}
                          </span>
                          {isActive && (
                            <span className="ml-2 text-[10px] text-[#2F855A] font-normal">← terpilih</span>
                          )}
                        </td>
                        {allJenis.map((j) => (
                          <td key={j} className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">
                            {dayData[j] != null ? (
                              `${dayData[j].toFixed(1)} kg`
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        ))}
                        <td className="px-5 py-3 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                          {dayTotal.toFixed(1)} kg
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {dates.map((date) => {
                const dayData  = byDate[date];
                const dayTotal = Object.values(dayData).reduce((s, v) => s + v, 0);
                const isActive = date === activeDate;
                return (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-4 py-3.5 cursor-pointer transition-colors ${
                      isActive ? "bg-green-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-semibold ${isActive ? "text-[#2F855A]" : "text-gray-900"}`}>
                        {date}
                      </p>
                      <p className="text-sm font-bold text-gray-900">{dayTotal.toFixed(1)} kg</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(dayData).map(([jenis, kg]) => (
                        <div key={jenis} className="flex items-center gap-1">
                          <JenisBadge jenis={jenis} />
                          <span className="text-xs text-gray-600">{kg.toFixed(1)} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
