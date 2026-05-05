"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User, MapPin, Phone, Home, CheckCircle, XCircle, Clock,
  ArrowRight, Banknote,
} from "lucide-react";
import { getSession, type SessionUser } from "@/lib/mockAuth";
import { members } from "@/data/adminData";
import { type IuranSubmission, BULAN_LABEL, getIuranKey } from "@/app/user/iuran/page";

export default function UserDashboardPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [iuranList, setIuranList] = useState<IuranSubmission[]>([]);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) return;
    const raw = localStorage.getItem(getIuranKey(s.email));
    if (raw) setIuranList(JSON.parse(raw));
  }, []);

  if (!session) return null;

  const memberData = members.find(
    (m) =>
      m.nama.toLowerCase() === session.nama.toLowerCase() ||
      m.email.toLowerCase() === session.email.toLowerCase()
  );

  const now = new Date();
  const bulanIniLabel = `${BULAN_LABEL[now.getMonth()]} ${now.getFullYear()}`;

  const iuranBulanIni = iuranList.find(
    (s) => s.bulanIdx === now.getMonth() && s.tahun === now.getFullYear()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Nasabah</h1>
        <p className="text-sm text-gray-500">Selamat datang, {session.nama.split(" ")[0]}!</p>
      </div>

      {/* Profil + Iuran */}
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
                <span>RW {memberData?.rw ?? session.rw} / RT {memberData?.rt ?? session.rt}</span>
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

        {/* Iuran */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Info Iuran Bulanan</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Status iuran bulan <span className="font-semibold text-gray-700">{bulanIniLabel}</span>
            </p>

            {iuranBulanIni ? (
              iuranBulanIni.statusVerifikasi === "diverifikasi" ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Sudah Diverifikasi</p>
                    <p className="text-xs text-green-600 mt-0.5">Pembayaran iuran bulan ini telah dikonfirmasi admin.</p>
                  </div>
                </div>
              ) : iuranBulanIni.statusVerifikasi === "menunggu" ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <Clock className="w-8 h-8 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-600">Menunggu Verifikasi</p>
                    <p className="text-xs text-amber-500 mt-0.5">Bukti sudah dikirim, menunggu konfirmasi admin.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-600">Pengajuan Ditolak</p>
                    <p className="text-xs text-red-500 mt-0.5">Bukti pembayaran ditolak admin. Silakan kirim ulang.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                <div>
                  <p className="font-semibold text-red-600">Belum Bayar</p>
                  <p className="text-xs text-red-500 mt-0.5">Iuran bulan ini belum dikirimkan.</p>
                </div>
              </div>
            )}

            <Link
              href="/user/iuran"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#2F855A] border border-[#2F855A]/30 rounded-xl py-2.5 hover:bg-green-50 transition-colors"
            >
              <Banknote className="w-4 h-4" />
              {iuranBulanIni ? "Lihat Riwayat Iuran" : "Kirim Bukti Iuran"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Riwayat Iuran */}
      {(() => {
        const tahunIni = now.getFullYear();
        const sorted = [...iuranList]
          .filter((s) => s.tahun === tahunIni)
          .sort((a, b) => b.bulanIdx - a.bulanIdx);
        const totalBayarTahunIni = iuranList.filter(
          (s) => s.tahun === tahunIni && s.statusVerifikasi === "diverifikasi"
        ).length;

        const STATUS_VERIF_STYLE: Record<IuranSubmission["statusVerifikasi"], string> = {
          menunggu:    "bg-amber-50 text-amber-600",
          diverifikasi:"bg-green-100 text-green-700",
          ditolak:     "bg-red-50 text-red-500",
        };
        const STATUS_VERIF_LABEL: Record<IuranSubmission["statusVerifikasi"], string> = {
          menunggu:    "Menunggu",
          diverifikasi:"Diverifikasi",
          ditolak:     "Ditolak",
        };

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#2F855A]" />
                <h2 className="text-sm font-semibold text-gray-800">Riwayat Iuran</h2>
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Banknote className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Belum ada riwayat iuran tahun {tahunIni}.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bulan</th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Pembayaran</th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sorted.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{entry.labelBulan}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Sudah Bayar
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_VERIF_STYLE[entry.statusVerifikasi]}`}>
                              {entry.statusVerifikasi === "diverifikasi" && <CheckCircle className="w-3 h-3" />}
                              {entry.statusVerifikasi === "menunggu"    && <Clock className="w-3 h-3" />}
                              {entry.statusVerifikasi === "ditolak"     && <XCircle className="w-3 h-3" />}
                              {STATUS_VERIF_LABEL[entry.statusVerifikasi]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Total bulan sudah dibayar tahun {tahunIni}:{" "}
                    <span className="font-semibold text-gray-700">{totalBayarTahunIni} bulan</span>
                  </p>
                  <Link href="/user/iuran" className="flex items-center gap-1 text-xs font-semibold text-[#2F855A] hover:underline">
                    Lihat semua <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}