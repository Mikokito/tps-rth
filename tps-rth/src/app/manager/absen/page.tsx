"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Clock, CalendarDays, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSession } from "@/lib/mockAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffMember = { id: string; nama: string; jabatan: string };
type AbsenStatus  = "menunggu" | "hadir" | "tidak_hadir";

type AbsenRow = {
  id: string; tanggal: string; staff_id: string;
  status: AbsenStatus; submitted_at: string;
  confirmed_at: string | null; confirmed_by: string | null;
};

type JadwalItem = { tanggal: string; staff_id: string; jam_mulai?: string };

type IzinItem = {
  staff_id: string; jenis: string; status: string;
  tanggal_mulai: string; tanggal_selesai: string; durasi: number;
};

type TodayStatus = "belum_hadir" | "hadir" | "telat" | "tidak_hadir" | "menunggu" | "tidak_dijadwalkan";

// ─── Constants ────────────────────────────────────────────────────────────────

const BULAN_LABEL = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const TODAY_BADGE: Record<TodayStatus, { label: string; className: string }> = {
  belum_hadir:        { label: "Belum Hadir",      className: "bg-red-100 text-red-600" },
  hadir:              { label: "Hadir",             className: "bg-green-100 text-green-700" },
  telat:              { label: "Telat",             className: "bg-orange-100 text-orange-600" },
  tidak_hadir:        { label: "Tidak Hadir",       className: "bg-red-50 text-red-500" },
  menunggu:           { label: "Menunggu",          className: "bg-amber-100 text-amber-600" },
  tidak_dijadwalkan:  { label: "Tidak Bertugas",    className: "bg-gray-100 text-gray-500" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerAbsenPage() {
  const now  = new Date();
  const today = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [managerNama, setManagerNama] = useState("");
  const [staffList,   setStaffList]   = useState<StaffMember[]>([]);
  const [records,     setRecords]     = useState<AbsenRow[]>([]);
  const [jadwalList,  setJadwalList]  = useState<JadwalItem[]>([]);
  const [izinList,    setIzinList]    = useState<IzinItem[]>([]);
  const [confirming,  setConfirming]  = useState<string | null>(null);

  const [rekapBulanIdx, setRekapBulanIdx] = useState(now.getMonth());
  const [rekapTahun,    setRekapTahun]    = useState(now.getFullYear());
  const TAHUN_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  useEffect(() => {
    async function init() {
      try {
        const session = await getSession();
        if (session) setManagerNama(session.nama);
        await loadAll();
      } catch (err) {
        console.error("init error:", err);
      }
    }
    init();
  }, []);

  async function loadAll() {
    const supabase = createClient();
    const [
      { data: staffData },
      { data: absenData },
      { data: jadwalData },
      { data: izinData },
    ] = await Promise.all([
      supabase.from("staff_members").select("id, nama, jabatan").order("nama"),
      supabase.from("absensi")
        .select("id, tanggal, staff_id, status, submitted_at, confirmed_at, confirmed_by")
        .order("submitted_at", { ascending: false }),
      supabase.from("jadwal_kerja").select("tanggal, staff_id, jam_mulai"),
      supabase.from("izin_cuti")
        .select("staff_id, jenis, status, tanggal_mulai, tanggal_selesai, durasi")
        .eq("status", "disetujui"),
    ]);
    if (staffData) setStaffList(staffData);
    if (absenData) setRecords(absenData as AbsenRow[]);
    if (jadwalData) setJadwalList(jadwalData as JadwalItem[]);
    if (izinData)   setIzinList(izinData as IzinItem[]);
  }

  // ── Today's attendance status per staff ───────────────────────────────────
  function getTodayStatus(staffId: string): TodayStatus {
    const jadwal = jadwalList.find((j) => j.staff_id === staffId && j.tanggal === today);
    if (!jadwal) return "tidak_dijadwalkan";

    const absen = records.find((r) => r.staff_id === staffId && r.tanggal === today);
    if (!absen) return "belum_hadir";

    if (absen.status === "menunggu")    return "menunggu";
    if (absen.status === "tidak_hadir") return "tidak_hadir";

    // confirmed hadir — check if submitted after scheduled jam_mulai
    if (absen.status === "hadir" && jadwal.jam_mulai) {
      const submitted  = new Date(absen.submitted_at);
      const scheduled  = new Date(`${today}T${jadwal.jam_mulai}:00`);
      if (submitted > scheduled) return "telat";
    }

    return "hadir";
  }

  // ── Pending konfirmasi ────────────────────────────────────────────────────
  const pendingList = useMemo(() =>
    [...records.filter((r) => r.status === "menunggu")]
      .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at)),
    [records],
  );

  async function handleKonfirmasi(record: AbsenRow, newStatus: "hadir" | "tidak_hadir") {
    if (confirming) return;
    setConfirming(record.id);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("absensi")
        .update({ status: newStatus, confirmed_at: new Date().toISOString(), confirmed_by: managerNama || "Manager" })
        .eq("id", record.id)
        .select("id, tanggal, staff_id, status, submitted_at, confirmed_at, confirmed_by")
        .single();
      if (data) setRecords((prev) => prev.map((r) => r.id === record.id ? data as AbsenRow : r));
    } catch (err) {
      console.error("konfirmasi error:", err);
    } finally {
      setConfirming(null);
    }
  }

  function staffNama(id: string)    { return staffList.find((s) => s.id === id)?.nama    ?? "—"; }
  function staffJabatan(id: string) { return staffList.find((s) => s.id === id)?.jabatan ?? ""; }

  // ── Rekap bulanan ─────────────────────────────────────────────────────────
  const rekapKey = `${rekapTahun}-${String(rekapBulanIdx + 1).padStart(2, "0")}`;

  const rekapData = useMemo(() => {
    const monthStart     = `${rekapKey}-01`;
    const nextMonthStart = rekapBulanIdx === 11
      ? `${rekapTahun + 1}-01-01`
      : `${rekapTahun}-${String(rekapBulanIdx + 2).padStart(2, "0")}-01`;

    const bulanAbsen  = records.filter((r) => r.tanggal.startsWith(rekapKey) && r.status !== "menunggu");
    const bulanJadwal = jadwalList.filter((j) => j.tanggal.startsWith(rekapKey));
    const bulanIzin   = izinList.filter((iz) =>
      iz.tanggal_mulai < nextMonthStart && iz.tanggal_selesai >= monthStart,
    );

    return staffList.map((staff) => {
      const absenRecs  = bulanAbsen.filter((r) => r.staff_id === staff.id);
      const jadwalRecs = bulanJadwal.filter((j) => j.staff_id === staff.id);
      const hadir      = absenRecs.filter((r) => r.status === "hadir").length;
      const total      = jadwalRecs.length;
      const izinAktif  = bulanIzin.filter((iz) => iz.staff_id === staff.id);
      return { staff, hadir, total, izinAktif };
    });
  }, [staffList, records, jadwalList, izinList, rekapKey, rekapBulanIdx, rekapTahun]);

  const adaData = rekapData.some((r) => r.total > 0 || r.hadir > 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Konfirmasi Absen</h1>
        <p className="text-sm text-gray-500">Konfirmasi kehadiran petugas yang telah absen</p>
      </div>

      {/* ── Pending ── */}
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
                      {" · Dikirim "}
                      {new Date(record.submitted_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={confirming === record.id}
                    onClick={() => handleKonfirmasi(record, "hadir")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {confirming === record.id ? "..." : "Konfirmasi Hadir"}
                  </button>
                  <button type="button" disabled={confirming === record.id}
                    onClick={() => handleKonfirmasi(record, "tidak_hadir")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60 transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Tidak Hadir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Rekap bulanan ── */}
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

        {!adaData ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            Belum ada data jadwal atau absen untuk {BULAN_LABEL[rekapBulanIdx]} {rekapTahun}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Absen Hari Ini</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Kehadiran</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Izin / Cuti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rekapData.map(({ staff, hadir, total, izinAktif }) => {
                  const todayStatus = getTodayStatus(staff.id);
                  const badge = TODAY_BADGE[todayStatus];

                  return (
                    <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                      {/* Nama */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#2F855A]/10 flex items-center justify-center text-[#2F855A] text-xs font-bold shrink-0">
                            {staff.nama[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{staff.nama}</p>
                            <p className="text-xs text-gray-400">{staff.jabatan}</p>
                          </div>
                        </div>
                      </td>

                      {/* Absen Hari Ini */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                          {todayStatus === "hadir"       && <CheckCircle className="w-3 h-3" />}
                          {todayStatus === "tidak_hadir" && <XCircle className="w-3 h-3" />}
                          {todayStatus === "telat"       && <Clock className="w-3 h-3" />}
                          {todayStatus === "menunggu"    && <Clock className="w-3 h-3" />}
                          {todayStatus === "belum_hadir" && <AlertCircle className="w-3 h-3" />}
                          {badge.label}
                        </span>
                      </td>

                      {/* Total Kehadiran: X/Y hari */}
                      <td className="px-4 py-3.5 text-center">
                        {total === 0 ? (
                          <span className="text-xs text-gray-300">Belum ada jadwal</span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">
                            {hadir}
                            <span className="text-gray-400 font-normal">/{total}</span>
                            <span className="text-xs text-gray-400 font-normal ml-0.5">hari</span>
                          </span>
                        )}
                      </td>

                      {/* Status Izin / Cuti */}
                      <td className="px-4 py-3.5 text-center">
                        {izinAktif.length === 0 ? (
                          <span className="text-xs text-gray-300">—</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {izinAktif.map((iz, i) => (
                              <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                iz.jenis === "cuti"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "bg-orange-50 text-orange-600 border border-orange-100"
                              }`}>
                                <AlertCircle className="w-3 h-3" />
                                {iz.jenis === "cuti" ? "Cuti" : "Izin"} {iz.durasi} hari
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
