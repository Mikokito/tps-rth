"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, FileText, Trash2, ChevronRight, Clock, AlertCircle, ClipboardList } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type AbsenRecord = {
  id: string;
  tanggal: string;
  status: "hadir" | "izin" | "absen";
  last_modified: string;
};

type IzinRecord = {
  id: string;
  status: "menunggu" | "disetujui" | "ditolak";
};

type JadwalRow = {
  id: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  deskripsi: string | null;
};

const STATUS_ABSEN_CLS: Record<AbsenRecord["status"], string> = {
  hadir: "bg-green-100 text-green-700",
  izin:  "bg-amber-50 text-amber-600",
  absen: "bg-red-50 text-red-500",
};
const STATUS_ABSEN_LABEL: Record<AbsenRecord["status"], string> = {
  hadir: "Hadir", izin: "Izin", absen: "Tidak Hadir",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [session, setSession]     = useState<SessionUser | null>(null);
  const [absenList, setAbsenList] = useState<AbsenRecord[]>([]);
  const [izinList, setIzinList]   = useState<IzinRecord[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalRow[]>([]);

  useEffect(() => {
    async function init() {
      const s = await getSession();
      setSession(s);
      if (!s) return;

      const supabase = createClient();
      const { data: staffRow } = await supabase
        .from("staff_members").select("id").eq("nama", s.nama).maybeSingle();

      if (staffRow?.id) {
        const [{ data: absenData }, { data: izinData }, { data: jadwalData }] = await Promise.all([
          supabase.from("absensi")
            .select("id, tanggal, status, last_modified")
            .eq("staff_id", staffRow.id)
            .order("tanggal", { ascending: false }),
          supabase.from("izin_cuti")
            .select("id, status")
            .eq("staff_id", staffRow.id),
          supabase.from("jadwal_kerja")
            .select("id, tanggal, jam_mulai, jam_selesai, deskripsi")
            .eq("staff_id", staffRow.id)
            .gte("tanggal", monthStart)
            .lte("tanggal", monthEnd)
            .order("tanggal", { ascending: true }),
        ]);
        if (absenData) setAbsenList(absenData);
        if (izinData)  setIzinList(izinData);
        if (jadwalData) setJadwalList(jadwalData);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayAbsen = useMemo(() => absenList.find((a) => a.tanggal === today), [absenList, today]);
  const pendingIzin = useMemo(() => izinList.filter((iz) => iz.status === "menunggu").length, [izinList]);

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Petugas</h1>
        <p className="text-sm text-gray-500">
          Selamat datang, <span className="font-semibold text-gray-700">{session.nama.split(" ")[0]}</span>!{" "}
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Absen hari ini */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#2F855A]" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Absen Hari Ini</p>
          </div>
          {todayAbsen ? (
            <div>
              <span className={`inline-flex px-4 py-1 rounded-full text-lg font-semibold ${STATUS_ABSEN_CLS[todayAbsen.status]}`}>
                {STATUS_ABSEN_LABEL[todayAbsen.status]}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1 mt-1.5">
                <Clock className="w-3 h-3" /> Terakhir diubah: {fmtDateTime(todayAbsen.last_modified)}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-medium">
              <AlertCircle className="w-4 h-4" /> Belum absen
            </span>
          )}
        </div>

        {/* Izin pending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Izin Menunggu</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingIzin}</p>
          <p className="text-xs text-gray-400 mt-0.5">pengajuan menunggu persetujuan</p>
        </div>
      </div>

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
            <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Izin / Cuti</p>
              <p className="text-xs text-gray-400">Ajukan izin atau cuti</p>
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

      {/* Agenda kerja bulanan */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-[#2F855A]" />
          <h2 className="text-sm font-semibold text-gray-700">
            Agenda Kerja —{" "}
            {now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {jadwalList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada jadwal bulan ini</p>
          ) : (
            jadwalList.map((j) => (
              <div key={j.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-14 text-center">
                  <p className="text-xs text-gray-400">
                    {new Date(j.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-bold text-gray-800 leading-none">
                    {new Date(j.tanggal + "T00:00:00").getDate()}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {j.jam_mulai.slice(0, 5)} – {j.jam_selesai.slice(0, 5)}
                  </p>
                  {j.deskripsi && (
                    <p className="text-xs text-gray-400 mt-0.5">{j.deskripsi}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
