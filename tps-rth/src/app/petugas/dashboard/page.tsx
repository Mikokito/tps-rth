"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, FileText, Trash2, ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";

type PetugasAbsen = {
  id: string;
  tanggal: string;
  status: "hadir" | "tidak hadir" | "izin";
  lastModified: string;
};

type PetugasIzin = {
  id: string;
  jenis: "izin" | "cuti";
  tglMulai: string;
  tglSelesai: string;
  alasan: string;
  status: "pending" | "disetujui" | "ditolak";
  createdAt: string;
};

const ABSEN_KEY  = "tps_rth_petugas_absen";
const IZIN_KEY   = "tps_rth_petugas_izin";

const STATUS_ABSEN_CLS: Record<PetugasAbsen["status"], string> = {
  hadir:         "bg-green-100 text-green-700",
  izin:          "bg-amber-50 text-amber-600",
  "tidak hadir": "bg-red-50 text-red-500",
};
const STATUS_ABSEN_LABEL: Record<PetugasAbsen["status"], string> = {
  hadir: "Hadir", izin: "Izin", "tidak hadir": "Tidak Hadir",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [absenList, setAbsenList] = useState<PetugasAbsen[]>([]);
  const [izinList, setIzinList]   = useState<PetugasIzin[]>([]);

  useEffect(() => {
    setSession(getSession());
    const rawAbsen = localStorage.getItem(ABSEN_KEY);
    if (rawAbsen) setAbsenList(JSON.parse(rawAbsen));
    const rawIzin = localStorage.getItem(IZIN_KEY);
    if (rawIzin) setIzinList(JSON.parse(rawIzin));
  }, []);

  const todayAbsen = useMemo(() => absenList.find((a) => a.tanggal === today), [absenList, today]);
  const pendingIzin = useMemo(() => izinList.filter((iz) => iz.status === "pending").length, [izinList]);

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

      {/* Status Cards */}
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
                <Clock className="w-3 h-3" /> Terakhir diubah: {fmtDateTime(todayAbsen.lastModified)}
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

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Menu Cepat</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/petugas/absen"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-[#2F855A]/40 hover:shadow transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
              <Calendar className="w-5 h-5 text-[#2F855A]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Absen</p>
              <p className="text-xs text-gray-400">Catat kehadiran harian</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2F855A] transition-colors" />
          </Link>

          <Link
            href="/petugas/izin"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-[#2F855A]/40 hover:shadow transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Izin / Cuti</p>
              <p className="text-xs text-gray-400">Ajukan izin atau cuti</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
          </Link>

          <Link
            href="/petugas/sampah"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-[#2F855A]/40 hover:shadow transition-all group"
          >
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