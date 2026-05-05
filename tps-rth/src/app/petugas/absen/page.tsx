"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, Check, Pencil, Calendar, Clock } from "lucide-react";

type PetugasAbsen = {
  id: string;
  tanggal: string;
  status: "hadir" | "tidak hadir" | "izin";
  lastModified: string;
};

const ABSEN_KEY = "tps_rth_petugas_absen";

const SEED_ABSEN: PetugasAbsen[] = [
  { id: "pa1", tanggal: "2025-04-25", status: "hadir",        lastModified: "2025-04-25T07:30:00.000Z" },
  { id: "pa2", tanggal: "2025-04-26", status: "hadir",        lastModified: "2025-04-26T07:15:00.000Z" },
  { id: "pa3", tanggal: "2025-04-27", status: "izin",         lastModified: "2025-04-27T08:00:00.000Z" },
  { id: "pa4", tanggal: "2025-04-28", status: "hadir",        lastModified: "2025-04-28T07:45:00.000Z" },
  { id: "pa5", tanggal: "2025-04-29", status: "tidak hadir",  lastModified: "2025-04-29T09:00:00.000Z" },
];

const STATUS_CLS: Record<PetugasAbsen["status"], string> = {
  hadir:         "bg-green-100 text-green-700",
  izin:          "bg-amber-50 text-amber-600",
  "tidak hadir": "bg-red-50 text-red-500",
};

const STATUS_LABEL: Record<PetugasAbsen["status"], string> = {
  hadir: "Hadir", izin: "Izin", "tidak hadir": "Tidak Hadir",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasAbsenPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [absenList, setAbsenList] = useState<PetugasAbsen[]>([]);
  const [absenStatus, setAbsenStatus] = useState<PetugasAbsen["status"]>("hadir");
  const [editingAbsen, setEditingAbsen] = useState(false);
  const [absenSaved, setAbsenSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(ABSEN_KEY);
    if (raw) {
      setAbsenList(JSON.parse(raw));
    } else {
      localStorage.setItem(ABSEN_KEY, JSON.stringify(SEED_ABSEN));
      setAbsenList(SEED_ABSEN);
    }
  }, []);

  const todayAbsen = useMemo(() => absenList.find((a) => a.tanggal === today), [absenList, today]);
  const historyAbsen = useMemo(() => [...absenList].sort((a, b) => b.tanggal.localeCompare(a.tanggal)), [absenList]);

  const isFormMode = editingAbsen || !todayAbsen;

  function handleSaveAbsen() {
    const now = new Date().toISOString();
    const updated = todayAbsen
      ? absenList.map((a) => a.tanggal === today ? { ...a, status: absenStatus, lastModified: now } : a)
      : [...absenList, { id: `pa-${Date.now()}`, tanggal: today, status: absenStatus, lastModified: now }];
    setAbsenList(updated);
    localStorage.setItem(ABSEN_KEY, JSON.stringify(updated));
    setEditingAbsen(false);
    setAbsenSaved(true);
    setTimeout(() => setAbsenSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Absen</h1>
        <p className="text-sm text-gray-500">Catat kehadiran harian Anda</p>
      </div>

      {/* Absen Hari Ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2F855A]" /> Absen Hari Ini
          </h2>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="p-5">
          {todayAbsen && !isFormMode ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-1 rounded-full text-lg font-semibold ${STATUS_CLS[todayAbsen.status]}`}>
                  {STATUS_LABEL[todayAbsen.status]}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Terakhir diubah: {fmtDateTime(todayAbsen.lastModified)}
                </span>
              </div>
              <button
                onClick={() => { setAbsenStatus(todayAbsen.status); setEditingAbsen(true); }}
                className="flex items-center gap-1.5 text-sm font-medium text-[#2F855A] hover:underline"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Absen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {editingAbsen && (
                <p className="text-xs text-amber-600 font-medium">Mode edit — akan menimpa absen hari ini</p>
              )}
              <div className="flex gap-3 flex-wrap">
                {(["hadir", "tidak hadir", "izin"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setAbsenStatus(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      absenStatus === s
                        ? s === "hadir"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : s === "izin"
                          ? "border-amber-400 bg-amber-50 text-amber-600"
                          : "border-red-400 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAbsen}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    absenSaved
                      ? "bg-green-100 text-green-700"
                      : editingAbsen
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-[#2F855A] text-white hover:bg-[#276749]"
                  }`}
                >
                  {absenSaved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Absen</>}
                </button>
                {editingAbsen && (
                  <button onClick={() => setEditingAbsen(false)} className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
                    Batal
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Absen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Riwayat Absen</h2>
          <p className="text-xs text-gray-400 mt-0.5">{absenList.length} catatan</p>
        </div>
        {historyAbsen.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Belum ada data absen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Terakhir Diubah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyAbsen.map((a) => (
                  <tr key={a.id} className={`hover:bg-gray-50 ${a.tanggal === today ? "bg-green-50/30" : ""}`}>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      {a.tanggal}
                      {a.tanggal === today && <span className="ml-1.5 text-[10px] text-[#2F855A] font-semibold">Hari ini</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{fmtDateTime(a.lastModified)}</td>
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