"use client";

import { useMemo } from "react";
import { Users, CalendarDays, CalendarCheck, Clock } from "lucide-react";
import { staffMembers, absenRecords, izinCutiData, seedJadwalHarian } from "@/data/adminData";

export default function ManagerDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const totalPetugas = staffMembers.length;

    const jadwalHariIni = seedJadwalHarian.find((j) => j.tanggal === today)?.petugas.length ?? 0;

    const hadirHariIni = absenRecords.filter(
      (a) => a.tanggal === today && a.status === "hadir"
    ).length;

    const pengajuanPending = izinCutiData.filter(
      (e) => e.status === "menunggu"
    ).length;

    return { totalPetugas, jadwalHariIni, hadirHariIni, pengajuanPending };
  }, [today]);

  const cards = [
    {
      label: "Total Petugas",
      value: stats.totalPetugas,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      desc: "petugas terdaftar",
    },
    {
      label: "Jadwal Hari Ini",
      value: stats.jadwalHariIni,
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      desc: "petugas dijadwalkan",
    },
    {
      label: "Hadir Hari Ini",
      value: stats.hadirHariIni,
      icon: CalendarCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      desc: "petugas hadir",
    },
    {
      label: "Izin/Cuti Pending",
      value: stats.pengajuanPending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      desc: "menunggu persetujuan",
    },
  ];

  const recentIzin = izinCutiData
    .filter((e) => e.status === "menunggu")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Manager</h1>
        <p className="text-sm text-gray-500">Ringkasan operasional petugas TPS RTH</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, border, desc }) => (
          <div key={label} className={`bg-white rounded-xl p-4 shadow-sm border ${border}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* Pending izin/cuti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Pengajuan Izin &amp; Cuti Menunggu</h2>
          <p className="text-xs text-gray-400 mt-0.5">Perlu tindakan persetujuan</p>
        </div>
        {recentIzin.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Tidak ada pengajuan yang menunggu.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentIzin.map((entry) => (
              <div key={entry.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{entry.namaPetugas}</p>
                  <p className="text-xs text-gray-400">{entry.jabatan} · {entry.jenis} · {entry.tanggalMulai}</p>
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 shrink-0">
                  Menunggu
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Daftar Petugas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jabatan</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffMembers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{s.nama}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.jabatan}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      s.statusGaji === "sudah" ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-600"
                    }`}>
                      {s.statusGaji === "sudah" ? "Sudah" : "Belum"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
