"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, FileText, Trash2, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type AbsenStatus = "menunggu" | "hadir" | "tidak_hadir";
type IzinStatus  = "menunggu" | "disetujui" | "ditolak";

type AbsenRecord = {
  id: string;
  tanggal: string;
  status: AbsenStatus;
  submitted_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
};

type IzinRecord = {
  id: string;
  jenis: "izin" | "cuti";
  durasi: "setengah_hari" | "sehari" | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: IzinStatus;
  submitted_at: string;
};

function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function PetugasDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const now   = new Date();

  const [session,   setSession]   = useState<SessionUser | null>(null);
  const [staffId,   setStaffId]   = useState<string | null>(null);
  const [absenList, setAbsenList] = useState<AbsenRecord[]>([]);
  const [izinList,  setIzinList]  = useState<IzinRecord[]>([]);
  const [ready,     setReady]     = useState(false);

  useEffect(() => {
    async function init() {
      const s = await getSession();
      setSession(s);
      if (!s) { setReady(true); return; }

      const supabase = createClient();
      const { data: staffRow } = await supabase
        .from("staff_members").select("id").eq("nama", s.nama).maybeSingle();

      const sid = staffRow?.id ?? null;
      setStaffId(sid);

      if (sid) {
        const [{ data: absenData }, { data: izinData }] = await Promise.all([
          supabase.from("absensi")
            .select("id, tanggal, status, submitted_at, confirmed_at, confirmed_by")
            .eq("staff_id", sid)
            .order("tanggal", { ascending: false })
            .limit(30),
          supabase.from("izin_cuti")
            .select("id, jenis, durasi, tanggal_mulai, tanggal_selesai, alasan, status, submitted_at")
            .eq("staff_id", sid)
            .order("submitted_at", { ascending: false })
            .limit(10),
        ]);
        if (absenData) setAbsenList(absenData as AbsenRecord[]);
        if (izinData)  setIzinList(izinData  as IzinRecord[]);
      }
      setReady(true);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayAbsen  = useMemo(() => absenList.find((a) => a.tanggal === today), [absenList, today]);
  const pendingIzin = useMemo(() => izinList.filter((iz) => iz.status === "menunggu"), [izinList]);

  if (!ready) return (
    <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>
  );
  if (!session) return null;

  const jenisLabel = (iz: IzinRecord) =>
    iz.jenis === "cuti" ? "Cuti" :
    iz.durasi === "setengah_hari" ? "Izin Setengah Hari" : "Izin Sehari";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Petugas</h1>
        <p className="text-sm text-gray-500">
          Selamat datang, <span className="font-semibold text-gray-700">{session.nama.split(" ")[0]}</span>!{" "}
          {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── STATUS HARI INI ──────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Absen hari ini */}
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Absen Hari Ini</span>
            </div>
            {/* Status badge */}
            {!todayAbsen ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Belum Absen</span>
            ) : todayAbsen.status === "menunggu" ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">Menunggu</span>
            ) : todayAbsen.status === "hadir" ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Dikonfirmasi</span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-500">Tidak Hadir</span>
            )}
          </div>

          <div className="px-4 py-4 flex items-center gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              !todayAbsen ? "bg-gray-100" :
              todayAbsen.status === "menunggu" ? "bg-amber-100" :
              todayAbsen.status === "hadir"    ? "bg-green-100" : "bg-red-100"
            }`}>
              {!todayAbsen
                ? <AlertCircle className="w-5 h-5 text-gray-300" />
                : todayAbsen.status === "menunggu"
                ? <Clock className="w-5 h-5 text-amber-400" />
                : todayAbsen.status === "hadir"
                ? <CheckCircle className="w-5 h-5 text-green-500" />
                : <XCircle className="w-5 h-5 text-red-400" />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              {!todayAbsen ? (
                <>
                  <p className="text-sm font-semibold text-gray-600">Belum absen hari ini</p>
                  <Link href="/petugas/absen"
                    className="text-xs text-[#2F855A] font-medium hover:underline mt-0.5 inline-block">
                    Absen sekarang →
                  </Link>
                </>
              ) : todayAbsen.status === "menunggu" ? (
                <>
                  <p className="text-sm font-semibold text-amber-700">Absen terkirim</p>
                  <p className="text-xs text-amber-500 mt-0.5">
                    Dikirim pukul {new Date(todayAbsen.submitted_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · Menunggu konfirmasi
                  </p>
                </>
              ) : todayAbsen.status === "hadir" ? (
                <>
                  <p className="text-sm font-semibold text-green-700">Hadir — Dikonfirmasi</p>
                  <p className="text-xs text-green-500 mt-0.5">
                    Oleh {todayAbsen.confirmed_by ?? "Supervisor"}{todayAbsen.confirmed_at && ` · ${new Date(todayAbsen.confirmed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-red-600">Tidak Hadir</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Dikonfirmasi oleh {todayAbsen.confirmed_by ?? "Supervisor"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Izin / Cuti pending */}
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Izin / Cuti</span>
            </div>
            {pendingIzin.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                {pendingIzin.length} Menunggu
              </span>
            )}
          </div>

          <div className="px-4 py-4">
            {pendingIzin.length === 0 ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Tidak ada pengajuan pending</p>
                  <Link href="/petugas/izin"
                    className="text-xs text-[#2F855A] font-medium hover:underline mt-0.5 inline-flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Ajukan izin / cuti
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingIzin.slice(0, 2).map((iz) => {
                  const isMulti = iz.tanggal_mulai !== iz.tanggal_selesai;
                  return (
                    <div key={iz.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-blue-800">{jenisLabel(iz)}</p>
                        <p className="text-xs text-blue-500 truncate">
                          {isMulti
                            ? `${fmtDate(iz.tanggal_mulai)} — ${fmtDate(iz.tanggal_selesai)} (${diffDays(iz.tanggal_mulai, iz.tanggal_selesai) + 1} hari)`
                            : fmtDate(iz.tanggal_mulai)}
                        </p>
                        <p className="text-[11px] text-blue-400 truncate">{iz.alasan}</p>
                      </div>
                    </div>
                  );
                })}
                {pendingIzin.length > 2 && (
                  <Link href="/petugas/izin" className="text-xs text-blue-500 font-medium hover:underline">
                    +{pendingIzin.length - 2} lainnya →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MENU CEPAT ──────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Menu Cepat</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/petugas/absen"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-[#2F855A]/40 hover:shadow transition-all group">
            <div className="w-10 h-10 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
              <Calendar className="w-5 h-5 text-[#2F855A]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Absen</p>
              <p className="text-xs text-gray-400">Catat kehadiran harian</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2F855A] transition-colors" />
          </Link>

          <Link href="/petugas/izin"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-[#2F855A]/40 hover:shadow transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors relative">
              <FileText className="w-5 h-5 text-blue-500" />
              {pendingIzin.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingIzin.length}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Izin / Cuti</p>
              <p className="text-xs text-gray-400">
                {pendingIzin.length > 0 ? `${pendingIzin.length} pengajuan menunggu` : "Ajukan izin atau cuti"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
          </Link>

          <Link href="/petugas/sampah"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-[#2F855A]/40 hover:shadow transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <Trash2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Input Sampah</p>
              <p className="text-xs text-gray-400">Catat setoran sampah</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
