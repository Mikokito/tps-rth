"use client";

import { useState, useMemo } from "react";
import { Check, Pencil, X, Save, CalendarDays } from "lucide-react";
import { staffMembers, absenRecords as initialRecords, type AbsenEntry } from "@/data/adminData";

const STATUS_OPTIONS: AbsenEntry["status"][] = ["hadir", "izin", "absen"];

const STATUS_STYLE: Record<AbsenEntry["status"], string> = {
  hadir: "bg-green-100 text-green-700",
  izin:  "bg-amber-50 text-amber-600",
  absen: "bg-red-50 text-red-500",
};

const STATUS_LABEL: Record<AbsenEntry["status"], string> = {
  hadir: "Hadir",
  izin:  "Izin",
  absen: "Absen",
};

const BTN_ACTIVE: Record<AbsenEntry["status"], string> = {
  hadir: "border-green-500 bg-green-50 text-green-700",
  izin:  "border-amber-400 bg-amber-50 text-amber-600",
  absen: "border-red-400 bg-red-50 text-red-500",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace("pukul", "pukul");
}

export default function AbsenPage() {
  const [records, setRecords] = useState<AbsenEntry[]>(initialRecords);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AbsenEntry["status"]>("hadir");
  const [savedId, setSavedId] = useState<string | null>(null);
  const now = new Date();
  const [rekapBulanIdx, setRekapBulanIdx] = useState(now.getMonth()); // 0–11
  const [rekapTahun, setRekapTahun] = useState(now.getFullYear());

  const rekapBulan = `${rekapTahun}-${String(rekapBulanIdx + 1).padStart(2, "0")}`;

  const BULAN_LABEL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const TAHUN_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  // Rows for selected date: one entry per staff member
  const dateRows = useMemo(() => {
    return staffMembers.map((staff) => {
      const entry = records.find((r) => r.tanggal === selectedDate && r.staffId === staff.id);
      return { staff, entry };
    });
  }, [records, selectedDate]);

  function startEdit(staffId: string, currentStatus: AbsenEntry["status"]) {
    setEditingId(staffId);
    setEditStatus(currentStatus);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleSave(staff: typeof staffMembers[0]) {
    const now = new Date().toISOString();
    const existing = records.find((r) => r.tanggal === selectedDate && r.staffId === staff.id);
    if (existing) {
      setRecords((prev) =>
        prev.map((r) =>
          r.tanggal === selectedDate && r.staffId === staff.id
            ? { ...r, status: editStatus, lastModified: now }
            : r
        )
      );
    } else {
      const newEntry: AbsenEntry = {
        id: `a-${Date.now()}-${staff.id}`,
        tanggal: selectedDate,
        staffId: staff.id,
        nama: staff.nama,
        jabatan: staff.jabatan,
        status: editStatus,
        lastModified: now,
      };
      setRecords((prev) => [...prev, newEntry]);
    }
    setEditingId(null);
    setSavedId(staff.id);
    setTimeout(() => setSavedId(null), 2000);
  }

  // Rekap bulan per staff
  const rekapBulanData = useMemo(() => {
    const bulanRecords = records.filter((r) => r.tanggal.startsWith(rekapBulan));
    const totalHari = new Set(bulanRecords.map((r) => r.tanggal)).size;
    return staffMembers.map((staff) => {
      const staffRecs = bulanRecords.filter((r) => r.staffId === staff.id);
      const hadir = staffRecs.filter((r) => r.status === "hadir").length;
      const izin  = staffRecs.filter((r) => r.status === "izin").length;
      const absen = staffRecs.filter((r) => r.status === "absen").length;
      const persen = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 0;
      return { staff, hadir, izin, absen, persen, totalHari };
    });
  }, [records, rekapBulan]);

  const hadirCount = dateRows.filter((r) => r.entry?.status === "hadir").length;
  const izinCount  = dateRows.filter((r) => r.entry?.status === "izin").length;
  const absenCount = dateRows.filter((r) => r.entry?.status === "absen").length;
  const kosongCount = dateRows.filter((r) => !r.entry).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Absen Pengurus</h1>
        <p className="text-sm text-gray-500">Catat dan edit kehadiran harian per pengurus</p>
      </div>

      {/* Absen harian */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Daftar Absen</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setEditingId(null); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
          />
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex-wrap text-xs font-medium">
          <span className="flex items-center gap-1.5 text-green-700"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{hadirCount} Hadir</span>
          <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{izinCount} Izin</span>
          <span className="flex items-center gap-1.5 text-red-500"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{absenCount} Absen</span>
          {kosongCount > 0 && <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{kosongCount} Belum diisi</span>}
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Terakhir Diubah</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dateRows.map(({ staff, entry }) => {
                const isEditing = editingId === staff.id;
                const isSaved   = savedId === staff.id;
                return (
                  <tr key={staff.id} className={`transition-colors ${isEditing ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                    {/* Nama */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{staff.nama}</p>
                      <p className="text-xs text-gray-400">{staff.jabatan}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      {isEditing ? (
                        <div className="flex gap-2 justify-center">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => setEditStatus(s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                                editStatus === s ? BTN_ACTIVE[s] : "border-gray-200 text-gray-400 hover:border-gray-300"
                              }`}
                            >
                              {STATUS_LABEL[s]}
                            </button>
                          ))}
                        </div>
                      ) : entry ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[entry.status]}`}>
                          {STATUS_LABEL[entry.status]}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Belum diisi</span>
                      )}
                    </td>

                    {/* Terakhir Diubah */}
                    <td className="px-4 py-3.5 text-xs text-gray-400 text-center">
                      {isEditing ? (
                        <span className="text-blue-400 italic text-xs">Mengedit...</span>
                      ) : entry ? (
                        `${fmtDateTime(entry.lastModified)}`
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleSave(staff)}
                            className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-3 py-1.5 rounded-lg hover:bg-[#276749] transition-colors"
                          >
                            {isSaved ? <><Check className="w-3 h-3" /> Tersimpan</> : <><Save className="w-3 h-3" /> Simpan</>}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <X className="w-3 h-3" /> Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(staff.id, entry?.status ?? "hadir")}
                          className="flex items-center gap-1 text-xs font-medium text-[#2F855A] hover:underline mx-auto"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden divide-y divide-gray-50">
          {dateRows.map(({ staff, entry }) => {
            const isEditing = editingId === staff.id;
            const isSaved   = savedId === staff.id;
            return (
              <div key={staff.id} className={`px-4 py-4 ${isEditing ? "bg-blue-50/40" : ""}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{staff.nama}</p>
                    <p className="text-xs text-gray-400">{staff.jabatan}</p>
                  </div>
                  {!isEditing && (
                    entry ? (
                      <span className={`inline-flex shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[entry.status]}`}>
                        {STATUS_LABEL[entry.status]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Belum diisi</span>
                    )
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditStatus(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                            editStatus === s ? BTN_ACTIVE[s] : "border-gray-200 text-gray-400"
                          }`}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(staff)}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-[#2F855A] px-3 py-1.5 rounded-lg hover:bg-[#276749]"
                      >
                        {isSaved ? <><Check className="w-3 h-3" /> Tersimpan</> : <><Save className="w-3 h-3" /> Simpan</>}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg"
                      >
                        <X className="w-3 h-3" /> Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {entry ? `Terakhir Diubah — ${fmtDateTime(entry.lastModified)}` : "—"}
                    </p>
                    <button
                      onClick={() => startEdit(staff.id, entry?.status ?? "hadir")}
                      className="flex items-center gap-1 text-xs font-medium text-[#2F855A] hover:underline"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rekap Bulan Ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Rekap Bulan Ini</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {rekapBulanData[0]?.totalHari ?? 0} hari kerja tercatat
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={rekapBulanIdx}
              onChange={(e) => setRekapBulanIdx(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white"
            >
              {BULAN_LABEL.map((b, i) => (
                <option key={i} value={i}>{b}</option>
              ))}
            </select>
            <select
              value={rekapTahun}
              onChange={(e) => setRekapTahun(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white"
            >
              {TAHUN_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        {rekapBulanData[0]?.totalHari === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Belum ada data absen untuk bulan ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-green-600 uppercase tracking-wide">Hadir</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-amber-500 uppercase tracking-wide">Izin</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-red-400 uppercase tracking-wide">Absen</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rekapBulanData.map(({ staff, hadir, izin, absen, persen, totalHari }) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{staff.nama}</p>
                      <p className="text-xs text-gray-400">{staff.jabatan}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">{hadir}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">{izin}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs font-bold">{absen}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${persen >= 80 ? "bg-green-500" : persen >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${totalHari > 0 ? persen : 0}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-8 ${persen >= 80 ? "text-green-600" : persen >= 60 ? "text-amber-500" : "text-red-500"}`}>
                          {totalHari > 0 ? `${persen}%` : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}