"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2, Users, UserCheck, Banknote,
  Newspaper, MessageSquare, CalendarCheck, AlertTriangle,
  Clock, CheckCircle2, Award,
} from "lucide-react";
import { getAdminDashboardData, type PetugasPerforma } from "@/app/actions/dashboard";

const quickLinks = [
  { href: "/admin/sampah",       label: "Input Sampah",    icon: Trash2,        desc: "Catat setoran baru" },
  { href: "/admin/petugas",      label: "Kelola Petugas",  icon: Users,         desc: "Update status gaji" },
  { href: "/admin/nasabah",      label: "Data Nasabah",    icon: UserCheck,     desc: "Lihat & filter" },
  { href: "/admin/iuran",        label: "Iuran",           icon: Banknote,      desc: "Verifikasi bukti bayar" },
  { href: "/admin/berita",       label: "Kelola Berita",   icon: Newspaper,     desc: "CRUD artikel" },
  { href: "/admin/pesan",        label: "Pesan Masuk",     icon: MessageSquare, desc: "Lihat pesan dari kontak" },
  { href: "/admin/absen",        label: "Absen Hari Ini",  icon: CalendarCheck, desc: "Catat kehadiran" },
];

function performaBarColor(persen: number): string {
  if (persen >= 80) return "#2F855A";
  if (persen >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function DashboardPage() {
  const [totalNasabah, setTotalNasabah] = useState(0);
  const [nasabahAktif, setNasabahAktif] = useState(0);
  const [totalPetugas, setTotalPetugas] = useState(0);
  const [totalSampahKg, setTotalSampahKg] = useState(0);
  const [iuranPending, setIuranPending] = useState(0);
  const [iuranSukses, setIuranSukses] = useState(0);
  const [petugasPerforma, setPetugasPerforma] = useState<PetugasPerforma[]>([]);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getAdminDashboardData();
      setTotalNasabah(data.totalNasabah);
      setNasabahAktif(data.nasabahAktif);
      setTotalPetugas(data.totalPetugas);
      setTotalSampahKg(data.totalSampahKg);
      setIuranPending(data.iuranPending);
      setIuranSukses(data.iuranSukses);
      setPetugasPerforma(data.petugasPerforma);
      setLoadError(data.error);
      setReady(true);
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Nasabah", value: totalNasabah.toString(),        sub: `${nasabahAktif} aktif`,   icon: UserCheck, color: "bg-blue-50 text-blue-600",   href: "/admin/nasabah" },
    { label: "Total Petugas", value: totalPetugas.toString(),        sub: "akun bertugas",            icon: Users,     color: "bg-purple-50 text-purple-600", href: "/admin/petugas" },
    { label: "Total Sampah",  value: `${totalSampahKg.toFixed(1)} kg`, sub: "seluruh setoran",         icon: Trash2,    color: "bg-green-50 text-green-600", href: "/admin/sampah"  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan aktivitas TPS RTH Cikaret</p>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Gagal memuat data: {loadError}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </Link>
        ))}

        {/* Status Iuran */}
        <Link href="/admin/iuran"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-amber-50 text-amber-600">
            <Banknote className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs font-medium text-gray-700">Status Iuran</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-sm font-bold text-amber-600">{iuranPending}</span>
              <span className="text-[10px] text-gray-400">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span className="text-sm font-bold text-green-600">{iuranSukses}</span>
              <span className="text-[10px] text-gray-400">Sukses</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Performa Petugas */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-[#2F855A]" />
          <h2 className="text-sm font-semibold text-gray-800">Performa Petugas</h2>
          <span className="text-xs text-gray-400">— berdasarkan kehadiran</span>
        </div>
        {!ready ? (
          <p className="text-sm text-gray-400">Memuat...</p>
        ) : petugasPerforma.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada petugas terdaftar.</p>
        ) : (
          <div className="space-y-3">
            {petugasPerforma.map((p) => (
              <div key={p.nama} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{p.nama}</p>
                  <p className="text-[10px] text-gray-400 truncate">{p.jabatan || "—"}</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${Math.max(p.persen, 6)}%`, backgroundColor: performaBarColor(p.persen) }}
                  >
                    <span className="text-[10px] text-white font-semibold">{p.persen}%</span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 w-16 text-right shrink-0">{p.hadir}/{p.totalAbsen} hadir</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-[#2F855A] hover:bg-[#F0FFF4] transition-colors">
              <div className="w-10 h-10 bg-[#F0FFF4] rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#2F855A]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
