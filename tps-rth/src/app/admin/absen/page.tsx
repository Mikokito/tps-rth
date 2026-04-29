"use client";

import { useState, useMemo } from "react";
import { Save, Check, Pencil, X } from "lucide-react";
import { staffMembers, absenRecords as initialRecords, type AbsenEntry } from "@/data/adminData";

const STATUS_OPTIONS: AbsenEntry["status"][] = ["hadir", "izin", "sakit", "alpha"];

const STATUS_STYLE: Record<AbsenEntry["status"], string> = {
  hadir: "bg-green-100 text-green-700",
  izin:  "bg-amber-50 text-amber-600",
  sakit: "bg-blue-50 text-blue-600",
  alpha: "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<AbsenEntry["status"], string> = {
  hadir: "Hadir", izin: "Izin", sakit: "Sakit", alpha: "Alpha",
};

type DailyAbsen = Record<string, AbsenEntry["status"]>;

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AbsenPage() {
  const [records, setRecords] = useState<AbsenEntry[]>(initialRecords);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const [dailyForm, setDailyForm] = useState<DailyAbsen>(() => {
    const init: DailyAbsen = {};
    staffMembers.forEach((s) => { init[s.id] = "hadir"; });
    return init;
  });

  // lastModified per tanggal
  const [lastModMap, setLastModMap] = useState<Record<string, string>>({
    "2025-04-28": "2025-04-28T08:30:00.000Z",
    "2025-04-25": "2025-04-25T08:15:00.000Z",
  });

  const [savedDate, setSavedDate] = useState<string | null>(null);

  function loadDateIntoForm(date: string) {
    const dateRecords = records.filter((r) => r.tanggal === date);
    if (dateRecords.length > 0) {
      const form: DailyAbsen = {};
      dateRecords.forEach((r) => { form[r.staffId] = r.status; });
      // fill missing staff with hadir
      staffMembers.forEach((s) => { if (!form[s.id]) form[s.id] = "hadir"; });
      setDailyForm(form);
    } else {
      const init: DailyAbsen = {};
      staffMembers.forEach((s) => { init[s.id] = "hadir"; });
      setDailyForm(init);
    }
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setEditingDate(null);
    loadDateIntoForm(date);
  }

  function startEdit(date: string) {
    setEditingDate(date);
    setSelectedDate(date);
    loadDateIntoForm(date);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingDate(null);
    const init: DailyAbsen = {};
    staffMembers.forEach((s) => { init[s.id] = "hadir"; });
    setDailyForm(init);
  }

  function handleSave() {
    const now = new Date().toISOString();
    const newEntries: AbsenEntry[] = staffMembers.map((s) => ({
      id: `a-${now}-${s.id}`,
      tanggal: selectedDate,
      staffId: s.id,
      nama: s.nama,
      jabatan: s.jabatan,
      status: dailyForm[s.id] ?? "hadir",
      lastModified: now,
    }));
    setRecords((prev) => [
      ...prev.filter((r) => r.tanggal !== selectedDate),
      ...newEntries,
    ]);
    setLastModMap((m) => ({ ...m, [selectedDate]: now }));
    setSavedDate(selectedDate);
    setEditingDate(null);
    setTimeout(() => setSavedDate(null), 2000);
  }

  const existingDates = useMemo(() => {
    return [...new Set(records.map((r) => r.tanggal))].sort((a, b) => b.localeCompare(a));
  }, [records]);

  const recapByDate = useMemo(() => {
    return existingDates.map((date) => {
      const dayRecords = records.filter((r) => r.tanggal === date);
      const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
      dayRecords.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
      return { date, counts, total: dayRecords.length, lastMod: lastModMap[date] };
    });
  }, [records, existingDates, lastModMap]);

  const isEditing = editingDate !== null;
  const formTitle = isEditing ? `Edit Absen — ${editingDate}` : `Absen Baru — ${selectedDate}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Absen Pengurus</h1>
        <p className="text-sm text-gray-500">Catat dan edit kehadiran harian</p>
      </div>

      {/* Form absen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{formTitle}</h2>
            {isEditing && (
              <p className="text-xs text-amber-600 mt-0.5">Mode edit — perubahan akan menimpa data tanggal ini</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
            )}
            {isEditing && (
              <button onClick={cancelEdit} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> Batal Edit
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {staffMembers.map((staff) => (
            <div key={staff.id} className="px-5 py-3 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-32">
                <p className="text-sm font-medium text-gray-900">{staff.nama}</p>
                <p className="text-xs text-gray-400">{staff.jabatan}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((status) => (
                  <button key={status} onClick={() => setDailyForm((f) => ({ ...f, [staff.id]: status }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      dailyForm[staff.id] === status ? STATUS_STYLE[status] : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}>
                    {STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={handleSave}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors ${
              savedDate === selectedDate ? "bg-green-100 text-green-700" : isEditing ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-[#2F855A] text-white hover:bg-[#276749]"
            }`}>
            {savedDate === selectedDate
              ? <><Check className="w-4 h-4" /> Tersimpan!</>
              : <><Save className="w-4 h-4" /> {isEditing ? "Simpan Perubahan" : "Simpan Absen"}</>}
          </button>
        </div>
      </div>

      {/* Rekap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Rekap Kehadiran</h2>
        </div>
        {recapByDate.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Belum ada data absen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-green-600 uppercase tracking-wide">Hadir</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-amber-500 uppercase tracking-wide">Izin</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-blue-500 uppercase tracking-wide">Sakit</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-red-400 uppercase tracking-wide">Alpha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Terakhir Diubah</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recapByDate.map(({ date, counts, lastMod }) => (
                  <tr key={date} className={`hover:bg-gray-50 transition-colors ${editingDate === date ? "bg-amber-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{date}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">{counts.hadir}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">{counts.izin}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-500 text-xs font-bold">{counts.sakit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-400 text-xs font-bold">{counts.alpha}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {lastMod ? fmtDateTime(lastMod) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingDate === date ? (
                        <span className="text-xs text-amber-600 font-medium">Sedang diedit</span>
                      ) : (
                        <button onClick={() => startEdit(date)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#2F855A] hover:underline">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      )}
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