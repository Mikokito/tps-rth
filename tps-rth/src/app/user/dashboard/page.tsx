"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User, MapPin, Phone, Home, CheckCircle, XCircle,
  Package, Newspaper, Calendar,
} from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { wasteEntries, members, iuranMember } from "@/data/adminData";
import { newsData } from "@/data/news";

function formatRp(n: number) { return "Rp " + n.toLocaleString("id"); }

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function UserDashboardPage() {
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return null;

  const memberData = members.find(
    (m) =>
      m.nama.toLowerCase() === session.nama.toLowerCase() ||
      m.email.toLowerCase() === session.email.toLowerCase()
  );

  const myEntries = iuranMember.filter(
    (e) => e.nasabahNama.toLowerCase() === session.nama.toLowerCase()
  );

  const now = new Date();
  const bulanIni = `${BULAN[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Nasabah</h1>
        <p className="text-sm text-gray-500">Selamat datang, {session.nama.split(" ")[0]}!</p>
      </div>

      {/* Profile + iuran */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Data Nasabah</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2F855A] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {session.nama[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{session.nama}</p>
                <p className="text-xs text-gray-400 truncate">{session.email}</p>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-3 space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Home className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>
                  RW {memberData?.rw ?? session.rw} / RT {memberData?.rt ?? session.rt}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{memberData?.alamat ?? session.alamat ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{memberData?.hp ?? session.hp ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Iuran */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Info Iuran Bulanan</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Iuran layanan angkut sampah bulan <span className="font-semibold text-gray-700">{bulanIni}</span>
            </p>
            {memberData ? (
              memberData.statusIuran === "sudah" ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Sudah Bayar</p>
                    <p className="text-xs text-green-600 mt-0.5">Iuran bulan ini telah terkonfirmasi.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-600">Belum Bayar</p>
                    <p className="text-xs text-red-500 mt-0.5">Silakan segera lunasi iuran bulan ini.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <XCircle className="w-8 h-8 text-gray-300 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-500">Belum Terdaftar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Akun belum tercatat sebagai nasabah aktif.</p>
                </div>
              </div>
            )}
            {memberData && (
              <p className="text-xs text-gray-400">
                Bergabung sejak {memberData.bergabungTanggal} ·{" "}
                <span className={memberData.statusAktif ? "text-green-600" : "text-red-400"}>
                  {memberData.statusAktif ? "Aktif" : "Tidak Aktif"}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Riwayat setoran */}
      <div className="grid gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Riwayat Setoran Sampah</h2>
          </div>
          {myEntries.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Belum ada riwayat setoran.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                    <th className="text-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Status Pembayaran</th>
                    <th className="text-right px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Iuran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-500 text-xs sm:text-sm">{entry.tanggal}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium ${
                          entry.statusIuran === "sudah"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {entry.statusIuran === "sudah" ? "Sudah Bayar" : "Belum Bayar"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900 text-xs sm:text-sm">{formatRp(entry.iuran)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}