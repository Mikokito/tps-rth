"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Clock, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSession } from "@/lib/mockAuth";

type StaffMember = { id: string; nama: string; jabatan: string };
type AbsenStatus = "menunggu" | "hadir" | "tidak_hadir";

type AbsenRow = {
  id: string;
  tanggal: string;
  staff_id: string;
  status: AbsenStatus;
  submitted_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
};

const STATUS_STYLE: Record<AbsenStatus, string> = {
  menunggu:    "bg-amber-50 text-amber-600",
  hadir:       "bg-green-100 text-green-700",
  tidak_hadir: "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<AbsenStatus, string> = {
  menunggu: "Menunggu", hadir: "Hadir", tidak_hadir: "Tidak Hadir",
};

const BULAN_LABEL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function ManagerAbsenPage() {
  const now = new Date();
  const [managerNama, setManagerNama] = useState("");
  const [staffList, setStaffList]     = useState<StaffMember[]>([]);
  const [records,   setRecords]       = useState<AbsenRow[]>([]);
  const [confirming, setConfirming]   = useState<string | null>(null);
  const [rekapBulanIdx, setRekapBulanIdx] = useState(now.getMonth());
  const [rekapTahun,    setRekapTahun]    = useState(now.getFullYear());
  const TAHUN_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (session) setManagerNama(session.nama);
      loadAll();
    }
    init();
  }, []);

  async function loadAll() {
    const supabase = createClient();
    const [{ data: staffData }, { data: absenData }] = await Promise.all([
      supabase.from("staff_members").select("id, nama, jabatan").order("nama"),
      supabase.from("absensi")
        .select("id, tanggal, staff_id, status, submitted_at, confirmed_at, confirmed_by")
        .order("submitted_at", { ascending: false }),
    ]);
    if (staffData) setStaffList(staffData);
    if (absenData) setRecords(absenData as AbsenRow[]);
  }

  // Pending = belum dikonfirmasi, diurutkan paling lama di atas
  const pendingList = useMemo(() =>
    [...records.filter((r) => r.status === "menunggu")]
      .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at)),
    [records],
  );

  async function handleKonfirmasi(record: AbsenRow, newStatus: "hadir" | "tidak_hadir") {
    if (confirming) return;
    setConfirming(record.id);
    const supabase   = createClient();
    const nowIso     = new Date().toISOString();
    const { data }   = await supabase
      .from("absensi")
      .update({ status: newStatus, confirmed_at: nowIso, confirmed_by: managerNama || "Manager" })
      .eq("id", record.id)
      .select("id, tanggal, staff_id, status, submitted_at, confirmed_at, confirmed_by")
      .single();
    if (data) setRecords((prev) => prev.map((r) => r.id === record.id ? data as AbsenRow : r));
    setConfirming(null);
  }

  function staffNama(staffId: string) {
    return staffList.find((s) => s.id === staffId)?.nama ?? "—";
  }
  function staffJabatan(staffId: string) {
    return staffList.find((s) => s.id === staffId)?.jabatan ?? "";
  }

  // ── Rekap ────────────────────────────────────────────────────
  const rekapKey = `${rekapTahun}-${String(rekapBulanIdx + 1).padStart(2, "0")}`;
  const rekapData = useMemo(() => {
    const bulanRecords = records.filter((r) => r.tanggal.startsWith(rekapKey) && r.status !== "menunggu");
    return staffList.map((staff) => {
      const recs      = bulanRecords.filter((r) => r.staff_id === staff.id);
      const hadir     = recs.filter((r) => r.status === "hadir").length;
      const tidakHadir = recs.filter((r) => r.status === "tidak_hadir").length;
      const total     = hadir + tidakHadir;
      const persen    = total > 0 ? Math.round((hadir / total) * 100) : 0;
      return { staff, hadir, tidakHadir, total, persen };
    });
  }, [staffList, records, rekapKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Konfirmasi Absen</h1>
        <p className="text-sm text-gray-500">Konfirmasi kehadiran petugas yang telah absen</p>
      </div>

      {/* ── Pending konfirmasi ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-800">Menunggu Konfirmasi</h2>
          </div>
          {pendingList.length > 0 && (
            <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingList.length}
            </span>
          )}
        </div>

        {pendingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <CheckCircle className="w-8 h-8 mb-2 text-green-300" />
            <p className="text-sm">Semua absen sudah dikonfirmasi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingList.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{staffNama(record.staff_id)}</p>
                    <p className="text-xs text-gray-400">{staffJabatan(record.staff_id)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(record.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                      {" · "}
                      Dikirim {new Date(record.submitted_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={confirming === record.id}
                    onClick={() => handleKonfirmasi(record, "hadir")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {confirming === record.id ? "..." : "Konfirmasi Hadir"}
                  </button>
                  <button
                    type="button"
                    disabled={confirming === record.id}
                    onClick={() => handleKonfirmasi(record, "tidak_hadir")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Tidak Hadir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Rekap bulanan ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Rekap Kehadiran</h2>
          </div>
          <div className="flex gap-2">
            <select value={rekapBulanIdx} onChange={(e) => setRekapBulanIdx(Number(e.target.value))} aria-label="Bulan"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
              {BULAN_LABEL.map((b, i) => <option key={i} value={i}>{b}</option>)}
            </select>
            <select value={rekapTahun} onChange={(e) => setRekapTahun(Number(e.target.value))} aria-label="Tahun"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
              {TAHUN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {rekapData.every((r) => r.total === 0) ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            Belum ada data absen terkonfirmasi untuk {BULAN_LABEL[rekapBulanIdx]} {rekapTahun}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-green-600 uppercase tracking-wide">Hadir</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-red-400 uppercase tracking-wide">Tidak Hadir</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rekapData.map(({ staff, hadir, tidakHadir, total, persen }) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{staff.nama}</p>
                      <p className="text-xs text-gray-400">{staff.jabatan}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">{hadir}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs font-bold">{tidakHadir}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${persen >= 80 ? "bg-green-500" : persen >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${total > 0 ? persen : 0}%` }} />
                        </div>
                        <span className={`text-xs font-semibold w-8 ${persen >= 80 ? "text-green-600" : persen >= 60 ? "text-amber-500" : "text-red-500"}`}>
                          {total > 0 ? `${persen}%` : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
