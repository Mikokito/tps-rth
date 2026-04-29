"use client";

import Link from "next/link";
import {
  Trash2, User, Users, UserCheck, DollarSign,
  Newspaper, FileText, CalendarCheck, TrendingUp,
} from "lucide-react";
import { wasteEntries, staffMembers, members, sampahByType } from "@/data/adminData";

const totalSampahBulanIni = wasteEntries.reduce((s, e) => s + e.beratKg, 0);
const totalNilai = wasteEntries.reduce((s, e) => s + e.total, 0);
const gajiTertagih = staffMembers.filter((s) => s.statusGaji === "belum").reduce((t, s) => t + s.gajiPokok, 0);
const nasabahAktif = members.filter((m) => m.statusAktif).length;

const statCards = [
  { label: "Total Nasabah Aktif", value: nasabahAktif.toString(),                    sub: `dari ${members.length} nasabah`,           icon: UserCheck,   color: "bg-blue-50 text-blue-600",   href: "/admin/nasabah"  },
  { label: "Sampah Bulan Ini",    value: `${totalSampahBulanIni.toFixed(1)} kg`,     sub: `${wasteEntries.length} setoran`,           icon: Trash2,      color: "bg-green-50 text-green-600", href: "/admin/sampah"   },
  { label: "Nilai Sampah",        value: `Rp ${totalNilai.toLocaleString("id")}`,    sub: "total transaksi bulan ini",                icon: TrendingUp,  color: "bg-amber-50 text-amber-600", href: "/admin/sampah"   },
  { label: "Gaji Belum Dibayar",  value: `Rp ${gajiTertagih.toLocaleString("id")}`, sub: `${staffMembers.filter(s=>s.statusGaji==="belum").length} pengurus`,  icon: Users, color: "bg-red-50 text-red-500",   href: "/admin/pengurus" },
// belum sama gaji petugas
];

const quickLinks = [
  { href: "/admin/sampah",   label: "Input Sampah",    icon: Trash2,        desc: "Catat setoran baru" },
  { href: "/admin/pengurus", label: "Kelola Pengurus", icon: User,         desc: "Update status gaji" },
  { href: "/admin/petugas",  label: "Kelola Petugas",  icon: Users,         desc: "Update status gaji" },
  { href: "/admin/nasabah",  label: "Data Nasabah",    icon: UserCheck,     desc: "Lihat & filter" },
  { href: "/admin/harga",    label: "Edit Harga",      icon: DollarSign,    desc: "Harga hari ini" },
  { href: "/admin/berita",   label: "Kelola Berita",   icon: Newspaper,     desc: "CRUD artikel" },
  { href: "/admin/laporan",  label: "Laporan",         icon: FileText,      desc: "Upload / download" },
  { href: "/admin/absen",    label: "Absen Hari Ini",  icon: CalendarCheck, desc: "Catat kehadiran" },
];

const maxKg = Math.max(...sampahByType.map((s) => s.kg));

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan aktivitas TPS RTH Cikaret — April 2025</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar chart — sampah by type */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Komposisi Sampah Bulan Ini (kg)</h2>
          <div className="space-y-3">
            {sampahByType.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28 shrink-0">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center pl-2 transition-all"
                    style={{ width: `${(item.kg / maxKg) * 100}%`, backgroundColor: item.color }}
                  >
                    <span className="text-[10px] text-white font-semibold">{item.kg} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent entries */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Setoran Terbaru</h2>
          <div className="space-y-3">
            {wasteEntries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{entry.nasabahNama}</p>
                  <p className="text-[11px] text-gray-400">{entry.jenisSampah} · {entry.beratKg} kg</p>
                </div>
                <span className="text-[11px] text-gray-500 shrink-0">{entry.tanggal.slice(5)}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/sampah" className="mt-3 block text-xs text-[#2F855A] font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-[#2F855A] hover:bg-[#F0FFF4] transition-colors"
            >
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