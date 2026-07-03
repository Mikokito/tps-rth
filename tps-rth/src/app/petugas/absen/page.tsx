"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Calendar, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type AbsenStatus = "menunggu" | "hadir" | "tidak_hadir";

type AbsenRecord = {
  id: string;
  tanggal: string;
  status: AbsenStatus;
  submitted_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
};

const STATUS_CONFIG: Record<AbsenStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  menunggu:     { label: "Menunggu Konfirmasi", cls: "bg-amber-50 text-amber-600",  icon: <Clock className="w-4 h-4" /> },
  hadir:        { label: "Hadir",               cls: "bg-green-100 text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
  tidak_hadir:  { label: "Tidak Hadir",         cls: "bg-red-50 text-red-500",      icon: <XCircle className="w-4 h-4" /> },
};

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function PetugasAbsenPage() {
  const today = new Date().toISOString().slice(0, 10);
  const now   = new Date();

  const [staffId,    setStaffId]    = useState<string | null>(null);
  const [absenList,  setAbsenList]  = useState<AbsenRecord[]>([]);
  const [ready,      setReady]      = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rekapBulan, setRekapBulan] = useState(now.getMonth());
  const [rekapTahun, setRekapTahun] = useState(now.getFullYear());

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) { setReady(true); return; }

      const supabase = createClient();
      const { data: staffRow } = await supabase
        .from("staff_members").select("id").eq("nama", session.nama).maybeSingle();

      const sid = staffRow?.id ?? null;
      setStaffId(sid);

      if (sid) {
        const { data } = await supabase
          .from("absensi")
          .select("id, tanggal, status, submitted_at, confirmed_at, confirmed_by")
          .eq("staff_id", sid)
          .order("tanggal", { ascending: false });
        if (data) setAbsenList(data as AbsenRecord[]);
      }
      setReady(true);
    }
    init();
  }, []);

  const todayRecord = useMemo(() => absenList.find((a) => a.tanggal === today), [absenList, today]);

  async function handleAbsen() {
    if (!staffId || submitting || todayRecord) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("absensi")
      .insert({ staff_id: staffId, tanggal: today })
      .select("id, tanggal, status, submitted_at, confirmed_at, confirmed_by")
      .single();

    if (data) {
      setAbsenList((prev) => [data as AbsenRecord, ...prev]);
    }
    setSubmitting(false);
  }

  // ── Rekap ────────────────────────────────────────────────────
  const rekapKey      = `${rekapTahun}-${String(rekapBulan + 1).padStart(2, "0")}`;
  const bulanRecords  = useMemo(
    () => [...absenList.filter((a) => a.tanggal.startsWith(rekapKey))]
            .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [absenList, rekapKey],
  );
  const hariHadir     = bulanRecords.filter((a) => a.status === "hadir").length;
  const hariTidak     = bulanRecords.filter((a) => a.status === "tidak_hadir").length;
  const hariMenunggu  = bulanRecords.filter((a) => a.status === "menunggu").length;
  const totalKonfirm  = hariHadir + hariTidak;
  const pctHadir      = totalKonfirm > 0 ? Math.round((hariHadir / totalKonfirm) * 100) : 0;

  const isCurrentMonth = rekapBulan === now.getMonth() && rekapTahun === now.getFullYear();

  function prevBulan() {
    if (rekapBulan === 0) { setRekapBulan(11); setRekapTahun((y) => y - 1); }
    else setRekapBulan((m) => m - 1);
  }
  function nextBulan() {
    if (isCurrentMonth) return;
    if (rekapBulan === 11) { setRekapBulan(0); setRekapTahun((y) => y + 1); }
    else setRekapBulan((m) => m + 1);
  }

  if (!ready) return (
    <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Absen</h1>
        <p className="text-sm text-gray-500">
          {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {!staffId ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Data petugas tidak ditemukan. Hubungi admin untuk menghubungkan akun.
        </div>
      ) : (
        <>
          {/* ── Absen hari ini ───────────────────────────────── */}
          <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100">

            {/* STATUS 1 — Belum absen */}
            {!todayRecord && (
              <div className="bg-white">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-800">Absen Hari Ini</h2>
                  <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                    Belum Absen
                  </span>
                </div>
                <div className="p-5 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Anda belum absen hari ini</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tekan tombol di bawah untuk mencatat kehadiran.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAbsen}
                    disabled={submitting}
                    className="flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold bg-[#2F855A] text-white hover:bg-[#276749] disabled:opacity-60 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {submitting ? "Mengirim..." : "Absen Hari Ini"}
                  </button>
                </div>
              </div>
            )}

            {/* STATUS 2 — Sudah absen, menunggu konfirmasi */}
            {todayRecord?.status === "menunggu" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl">
                <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-amber-700">Absen Hari Ini</h2>
                  <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                    Menunggu Konfirmasi
                  </span>
                </div>
                <div className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-amber-400" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">!</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Absen terkirim, menunggu konfirmasi</p>
                    <p className="text-xs text-amber-500 mt-1">
                      Dikirim pukul{" "}
                      {new Date(todayRecord.submitted_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-100 px-3 py-2 rounded-lg">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Supervisor/Manager akan mengkonfirmasi kehadiran Anda
                  </div>
                </div>
              </div>
            )}

            {/* STATUS 3 — Sudah dikonfirmasi */}
            {(todayRecord?.status === "hadir" || todayRecord?.status === "tidak_hadir") && (
              <div className={`rounded-xl border ${todayRecord.status === "hadir" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className={`px-5 py-4 border-b flex items-center gap-2 ${todayRecord.status === "hadir" ? "border-green-100" : "border-red-100"}`}>
                  {todayRecord.status === "hadir"
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <XCircle className="w-4 h-4 text-red-500" />
                  }
                  <h2 className={`text-sm font-semibold ${todayRecord.status === "hadir" ? "text-green-700" : "text-red-600"}`}>
                    Absen Hari Ini
                  </h2>
                  <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    todayRecord.status === "hadir" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  }`}>
                    {todayRecord.status === "hadir" ? "Dikonfirmasi Hadir" : "Tidak Hadir"}
                  </span>
                </div>
                <div className="p-5 flex flex-col items-center text-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    todayRecord.status === "hadir" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {todayRecord.status === "hadir"
                      ? <CheckCircle className="w-7 h-7 text-green-500" />
                      : <XCircle className="w-7 h-7 text-red-400" />
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${todayRecord.status === "hadir" ? "text-green-700" : "text-red-600"}`}>
                      {todayRecord.status === "hadir" ? "Kehadiran Anda dikonfirmasi" : "Anda tercatat tidak hadir"}
                    </p>
                    <p className={`text-xs mt-1 ${todayRecord.status === "hadir" ? "text-green-500" : "text-red-400"}`}>
                      Dikonfirmasi oleh{" "}
                      <span className="font-semibold">{todayRecord.confirmed_by ?? "Supervisor"}</span>
                      {todayRecord.confirmed_at && (
                        <> · {new Date(todayRecord.confirmed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Rekap bulanan ────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#2F855A]" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Rekap {BULAN[rekapBulan]} {rekapTahun}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={prevBulan} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 min-w-24 text-center font-medium">
                  {BULAN[rekapBulan].slice(0, 3)} {rekapTahun}
                </span>
                <button type="button" onClick={nextBulan} disabled={isCurrentMonth} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {bulanRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Belum ada data absen untuk {BULAN[rekapBulan]} {rekapTahun}.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total",       value: bulanRecords.length, cls: "text-gray-700"  },
                      { label: "Hadir",       value: hariHadir,           cls: "text-green-600" },
                      { label: "Tidak Hadir", value: hariTidak,           cls: "text-red-500"   },
                      { label: "Menunggu",    value: hariMenunggu,        cls: "text-amber-500" },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className={`text-xl font-bold ${cls}`}>{value}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {totalKonfirm > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Tingkat Kehadiran (dari yang sudah dikonfirmasi)</span>
                        <span className={`text-xs font-bold ${pctHadir >= 80 ? "text-green-600" : pctHadir >= 60 ? "text-amber-500" : "text-red-500"}`}>
                          {pctHadir}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pctHadir >= 80 ? "bg-green-500" : pctHadir >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${pctHadir}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 -mx-5 px-5">
                    {bulanRecords.map((a) => (
                      <div key={a.id} className={`flex items-center justify-between py-2.5 ${a.tanggal === today ? "bg-green-50/50 -mx-5 px-5 rounded" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 font-medium w-24">
                            {new Date(a.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                          {a.tanggal === today && <span className="text-[10px] text-[#2F855A] font-semibold">Hari ini</span>}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[a.status].cls}`}>
                          {STATUS_CONFIG[a.status].icon}
                          {STATUS_CONFIG[a.status].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
