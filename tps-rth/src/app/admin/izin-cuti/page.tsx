"use client";

import { useState, useMemo } from "react";
import { Check, X, CalendarRange, Clock } from "lucide-react";
import { izinCutiData, type IzinCutiEntry } from "@/data/adminData";

// --- Types ---
type Status = IzinCutiEntry["status"];
type FilterStatus = "semua" | Status;

// --- Constants ---
const STATUS_LABEL: Record<Status, string> = {
  menunggu:  "Menunggu",
  disetujui: "Disetujui",
  ditolak:   "Ditolak",
};

const STATUS_STYLE: Record<Status, string> = {
  menunggu:  "bg-blue-100 text-blue-700",
  disetujui: "bg-green-100 text-green-700",
  ditolak:   "bg-red-100 text-red-600",
};

const JENIS_STYLE: Record<IzinCutiEntry["jenis"], string> = {
  Izin: "bg-amber-50 text-amber-700 border border-amber-200",
  Cuti: "bg-violet-50 text-violet-700 border border-violet-200",
};

// --- Reusable sub-components ---
function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function JenisBadge({ jenis }: { jenis: IzinCutiEntry["jenis"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${JENIS_STYLE[jenis]}`}>
      {jenis}
    </span>
  );
}

function ActionButtons({
  entry,
  onApprove,
  onReject,
}: {
  entry: IzinCutiEntry;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (entry.status !== "menunggu") {
    return <span className="text-xs text-gray-300">—</span>;
  }
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <button
        onClick={() => onApprove(entry.id)}
        className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-2.5 py-1.5 rounded-lg hover:bg-[#276749] transition-colors"
      >
        <Check className="w-3 h-3" /> Setujui
      </button>
      <button
        onClick={() => onReject(entry.id)}
        className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
      >
        <X className="w-3 h-3" /> Tolak
      </button>
    </div>
  );
}

// --- Helpers ---
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function durasi(mulai: string, selesai: string) {
  const days =
    Math.round(
      (new Date(selesai).getTime() - new Date(mulai).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
  return days === 1 ? "1 hari" : `${days} hari`;
}

// --- Page ---
export default function IzinCutiPage() {
  const [entries, setEntries] = useState<IzinCutiEntry[]>(izinCutiData);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");

  const counts = useMemo(
    () => ({
      semua:     entries.length,
      menunggu:  entries.filter((e) => e.status === "menunggu").length,
      disetujui: entries.filter((e) => e.status === "disetujui").length,
      ditolak:   entries.filter((e) => e.status === "ditolak").length,
    }),
    [entries]
  );

  const filtered = useMemo(
    () =>
      filterStatus === "semua"
        ? entries
        : entries.filter((e) => e.status === filterStatus),
    [entries, filterStatus]
  );

  function handleApprove(id: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "disetujui" } : e))
    );
  }

  function handleReject(id: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "ditolak" } : e))
    );
  }

  const FILTER_TABS: { key: FilterStatus; label: string }[] = [
    { key: "semua",     label: "Semua" },
    { key: "menunggu",  label: "Menunggu" },
    { key: "disetujui", label: "Disetujui" },
    { key: "ditolak",   label: "Ditolak" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Izin &amp; Cuti</h1>
        <p className="text-sm text-gray-500">Kelola pengajuan izin dan cuti petugas</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: counts.semua,     color: "text-gray-700"},
          { label: "Menunggu",  value: counts.menunggu,  color: "text-blue-700"},
          { label: "Disetujui", value: counts.disetujui, color: "text-green-700"},
          { label: "Ditolak",   value: counts.ditolak,   color: "text-red-600"},
        ].map(({ label, value, color}) => (
          <div key={label} className={`bg-white shadow-sm border border-gray-100 rounded-xl px-4 py-3`}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Daftar Pengajuan</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === key
                    ? "bg-[#2F855A] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {label}{" "}
                <span className="opacity-70">
                  ({key === "semua" ? counts.semua : counts[key as Status]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
            <Clock className="w-8 h-8 opacity-30" />
            <p className="text-sm">
              {filterStatus === "semua"
                ? "Belum ada pengajuan."
                : `Tidak ada pengajuan dengan status "${STATUS_LABEL[filterStatus as Status]}".`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Petugas
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Jenis
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Tanggal Mulai
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Tanggal Selesai
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Durasi
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Alasan
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`transition-colors hover:bg-gray-50 ${
                        entry.status === "menunggu" ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.namaPetugas}
                        </p>
                        <p className="text-xs text-gray-400">{entry.jabatan}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <JenisBadge jenis={entry.jenis} />
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-600">
                        {fmtDate(entry.tanggalMulai)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-600">
                        {fmtDate(entry.tanggalSelesai)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">
                        {durasi(entry.tanggalMulai, entry.tanggalSelesai)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[200px]">
                        {entry.alasan}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <ActionButtons
                          entry={entry}
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className={`px-4 py-4 ${
                    entry.status === "menunggu" ? "bg-blue-50/20" : ""
                  }`}
                >
                  {/* Name + status */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.namaPetugas}
                      </p>
                      <p className="text-xs text-gray-400">{entry.jabatan}</p>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>

                  {/* Jenis + dates */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <JenisBadge jenis={entry.jenis} />
                    <span className="text-xs text-gray-500">
                      {fmtDate(entry.tanggalMulai)} – {fmtDate(entry.tanggalSelesai)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({durasi(entry.tanggalMulai, entry.tanggalSelesai)})
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    {entry.alasan}
                  </p>

                  {/* Action buttons */}
                  {entry.status === "menunggu" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(entry.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-3 py-1.5 rounded-lg hover:bg-[#276749] transition-colors"
                      >
                        <Check className="w-3 h-3" /> Setujui
                      </button>
                      <button
                        onClick={() => handleReject(entry.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3 h-3" /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
