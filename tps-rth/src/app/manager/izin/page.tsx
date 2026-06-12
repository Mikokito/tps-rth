"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, X, CalendarRange, Clock, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSession } from "@/lib/mockAuth";

type Status = "menunggu" | "disetujui" | "ditolak";
type FilterStatus = "semua" | Status;
type Jenis = "izin" | "cuti";
type Durasi = "setengah_hari" | "sehari" | null;

type IzinRow = {
  id: string;
  staff_id: string;
  jenis: Jenis;
  durasi: Durasi;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: Status;
  submitted_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  catatan: string | null;
  staff_members: { nama: string; jabatan: string | null } | null;
};

const STATUS_LABEL: Record<Status, string> = {
  menunggu:  "Menunggu",
  disetujui: "Disetujui",
  ditolak:   "Ditolak",
};

const STATUS_STYLE: Record<Status, string> = {
  menunggu:  "bg-amber-50 text-amber-600",
  disetujui: "bg-green-100 text-green-700",
  ditolak:   "bg-red-100 text-red-600",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
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

function jenisLabel(jenis: Jenis, d: Durasi) {
  if (jenis === "cuti") return "Cuti";
  return d === "setengah_hari" ? "Izin ½ Hari" : "Izin Sehari";
}

const JENIS_STYLE: Record<Jenis, string> = {
  izin: "bg-amber-50 text-amber-700 border border-amber-200",
  cuti: "bg-violet-50 text-violet-700 border border-violet-200",
};

export default function IzinCutiPage() {
  const [rows,        setRows]        = useState<IzinRow[]>([]);
  const [ready,       setReady]       = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");
  const [managerName, setManagerName] = useState<string>("");

  // Reject modal
  const [rejectId,   setRejectId]   = useState<string | null>(null);
  const [catatan,    setCatatan]    = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (session?.nama) setManagerName(session.nama);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("izin_cuti")
        .select(
          "id, staff_id, jenis, durasi, tanggal_mulai, tanggal_selesai, alasan, status, submitted_at, confirmed_at, confirmed_by, catatan, staff_members(nama, jabatan)"
        )
        .order("submitted_at", { ascending: false });

      if (error) console.error("izin_cuti load error:", error.message);
      if (data) setRows(data as IzinRow[]);
      setReady(true);
    }
    load();
  }, []);

  async function handleApprove(id: string) {
    setProcessing(id);
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("izin_cuti")
      .update({ status: "disetujui", confirmed_at: now, confirmed_by: managerName })
      .eq("id", id);
    if (!error) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "disetujui", confirmed_at: now, confirmed_by: managerName } : r
        )
      );
    }
    setProcessing(null);
  }

  function openReject(id: string) {
    setRejectId(id);
    setCatatan("");
  }

  async function confirmReject() {
    if (!rejectId) return;
    setProcessing(rejectId);
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("izin_cuti")
      .update({
        status: "ditolak",
        confirmed_at: now,
        confirmed_by: managerName,
        catatan: catatan.trim() || null,
      })
      .eq("id", rejectId);
    if (!error) {
      const rid = rejectId;
      setRows((prev) =>
        prev.map((r) =>
          r.id === rid
            ? { ...r, status: "ditolak", confirmed_at: now, confirmed_by: managerName, catatan: catatan.trim() || null }
            : r
        )
      );
    }
    setProcessing(null);
    setRejectId(null);
  }

  const counts = useMemo(
    () => ({
      semua:     rows.length,
      menunggu:  rows.filter((r) => r.status === "menunggu").length,
      disetujui: rows.filter((r) => r.status === "disetujui").length,
      ditolak:   rows.filter((r) => r.status === "ditolak").length,
    }),
    [rows]
  );

  const filtered = useMemo(
    () => filterStatus === "semua" ? rows : rows.filter((r) => r.status === filterStatus),
    [rows, filterStatus]
  );

  const FILTER_TABS: { key: FilterStatus; label: string }[] = [
    { key: "semua",     label: "Semua" },
    { key: "menunggu",  label: "Menunggu" },
    { key: "disetujui", label: "Disetujui" },
    { key: "ditolak",   label: "Ditolak" },
  ];

  if (!ready) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400 text-sm">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Izin &amp; Cuti</h1>
        <p className="text-sm text-gray-500">Kelola pengajuan izin dan cuti petugas</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: counts.semua,     color: "text-gray-700" },
          { label: "Menunggu",  value: counts.menunggu,  color: "text-amber-600" },
          { label: "Disetujui", value: counts.disetujui, color: "text-green-700" },
          { label: "Ditolak",   value: counts.ditolak,   color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white shadow-sm border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Daftar Pengajuan</h2>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Petugas</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mulai</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Selesai</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Durasi</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alasan</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className={`transition-colors hover:bg-gray-50 ${row.status === "menunggu" ? "bg-amber-50/30" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">
                          {row.staff_members?.nama ?? `Staff ${row.staff_id.slice(0, 6)}`}
                        </p>
                        <p className="text-xs text-gray-400">{row.staff_members?.jabatan ?? "—"}</p>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {new Date(row.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${JENIS_STYLE[row.jenis]}`}>
                          {jenisLabel(row.jenis, row.durasi)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-600">
                        {fmtDate(row.tanggal_mulai)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-600">
                        {fmtDate(row.tanggal_selesai)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">
                        {durasi(row.tanggal_mulai, row.tanggal_selesai)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-50">
                        <span>{row.alasan}</span>
                        {row.catatan && row.status === "ditolak" && (
                          <p className="text-[11px] text-red-400 mt-0.5 italic">Catatan: {row.catatan}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {row.status === "menunggu" ? (
                          <div className="flex items-center gap-1.5 justify-center">
                            <button
                              type="button"
                              disabled={processing === row.id}
                              onClick={() => handleApprove(row.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-2.5 py-1.5 rounded-lg hover:bg-[#276749] disabled:opacity-50 transition-colors"
                            >
                              <Check className="w-3 h-3" /> Setujui
                            </button>
                            <button
                              type="button"
                              disabled={processing === row.id}
                              onClick={() => openReject(row.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              <X className="w-3 h-3" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">
                            {row.confirmed_by ? `oleh ${row.confirmed_by}` : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map((row) => (
                <div
                  key={row.id}
                  className={`px-4 py-4 ${row.status === "menunggu" ? "bg-amber-50/20" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {row.staff_members?.nama ?? `Staff ${row.staff_id.slice(0, 6)}`}
                      </p>
                      <p className="text-xs text-gray-400">{row.staff_members?.jabatan ?? "—"}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLE[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${JENIS_STYLE[row.jenis]}`}>
                      {jenisLabel(row.jenis, row.durasi)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {fmtDate(row.tanggal_mulai)} – {fmtDate(row.tanggal_selesai)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({durasi(row.tanggal_mulai, row.tanggal_selesai)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1 leading-relaxed">{row.alasan}</p>
                  {row.catatan && row.status === "ditolak" && (
                    <p className="text-xs text-red-400 italic mb-2">Catatan: {row.catatan}</p>
                  )}
                  <p className="text-[11px] text-gray-300 mb-3">
                    Diajukan {new Date(row.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {row.confirmed_by && ` · oleh ${row.confirmed_by}`}
                  </p>
                  {row.status === "menunggu" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={processing === row.id}
                        onClick={() => handleApprove(row.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-3 py-1.5 rounded-lg hover:bg-[#276749] disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Setujui
                      </button>
                      <button
                        type="button"
                        disabled={processing === row.id}
                        onClick={() => openReject(row.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
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

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tolak Pengajuan</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tambahkan catatan penolakan (opsional)</p>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <MessageSquare className="w-3.5 h-3.5" /> Catatan
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misal: jadwal sudah penuh, harap ajukan ulang..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!!processing}
                onClick={confirmReject}
                className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {processing ? "Memproses..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
