"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  staffMembers,
  seedJadwalEntries,
  JADWAL_STORAGE_KEY,
  type JadwalEntry,
} from "@/data/adminData";

type Shift = JadwalEntry["shift"];

const SHIFT_OPTIONS: Shift[] = ["Pagi", "Sore", "Malam", "Libur"];

const SHIFT_STYLE: Record<Shift, string> = {
  Pagi:  "bg-amber-100 text-amber-700",
  Sore:  "bg-blue-100 text-blue-700",
  Malam: "bg-indigo-100 text-indigo-700",
  Libur: "bg-gray-100 text-gray-500",
};

const SHIFT_BTN_ACTIVE: Record<Shift, string> = {
  Pagi:  "bg-amber-500 text-white",
  Sore:  "bg-blue-500 text-white",
  Malam: "bg-indigo-500 text-white",
  Libur: "bg-gray-400 text-white",
};

const HARI_LABEL = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function getMondayOf(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function getWeekDates(monday: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function addWeeks(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n * 7);
  return d;
}

function fmtShort(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function fmtWeekRange(dates: string[]) {
  const a = new Date(dates[0] + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  const b = new Date(dates[6] + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return `${a} – ${b}`;
}

interface EditCell { staffId: string; staffNama: string; jabatan: string; date: string; }

export default function ManagerJadwalPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [monday, setMonday] = useState<Date>(() => getMondayOf(today));
  const [jadwal, setJadwal] = useState<JadwalEntry[]>([]);
  const [editCell, setEditCell] = useState<EditCell | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(JADWAL_STORAGE_KEY);
    setJadwal(raw ? JSON.parse(raw) : seedJadwalEntries);
  }, []);

  const weekDates = useMemo(() => getWeekDates(monday), [monday]);

  function prevWeek() { setMonday((d) => addWeeks(d, -1)); }
  function nextWeek() { setMonday((d) => addWeeks(d, 1)); }
  function goToday() { setMonday(getMondayOf(today)); }

  function getShift(staffId: string, date: string): Shift | undefined {
    return jadwal.find((j) => j.staffId === staffId && j.tanggal === date)?.shift;
  }

  function handleSelectShift(shift: Shift) {
    if (!editCell) return;
    const { staffId, staffNama, jabatan, date } = editCell;
    const existing = jadwal.find((j) => j.staffId === staffId && j.tanggal === date);
    let updated: JadwalEntry[];
    if (existing) {
      updated = jadwal.map((j) =>
        j.staffId === staffId && j.tanggal === date ? { ...j, shift } : j
      );
    } else {
      updated = [...jadwal, {
        id: `jd-${Date.now()}-${staffId}`,
        tanggal: date, staffId, namaPetugas: staffNama, jabatan, shift,
      }];
    }
    setJadwal(updated);
    localStorage.setItem(JADWAL_STORAGE_KEY, JSON.stringify(updated));
    setEditCell(null);
  }

  const currentShift = editCell ? getShift(editCell.staffId, editCell.date) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Jadwal Kerja Petugas</h1>
        <p className="text-sm text-gray-500">Atur jadwal shift mingguan untuk setiap petugas</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-4 h-4 text-[#2F855A]" />
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Jadwal Mingguan</h2>
              <p className="text-xs text-gray-400 mt-0.5">{fmtWeekRange(weekDates)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Minggu Ini
            </button>
            <button onClick={prevWeek} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextWeek} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex-wrap">
          {SHIFT_OPTIONS.map((s) => (
            <span key={s} className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${SHIFT_STYLE[s]}`}>{s}</span>
          ))}
          <span className="text-[11px] text-gray-400 ml-1">— klik sel untuk mengatur shift</span>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-44 sticky left-0 bg-gray-50">
                  Petugas
                </th>
                {weekDates.map((date, i) => {
                  const isToday = date === today;
                  return (
                    <th key={date} className={`text-center px-2 py-3 text-xs font-semibold uppercase tracking-wide w-28 ${isToday ? "text-[#2F855A]" : "text-gray-500"}`}>
                      <div>{HARI_LABEL[i]}</div>
                      <div className={`text-[10px] font-normal mt-0.5 ${isToday ? "text-[#2F855A] font-semibold" : "text-gray-400"}`}>
                        {fmtShort(date)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3 sticky left-0 bg-white group-hover:bg-gray-50/50 transition-colors border-r border-gray-50">
                    <p className="text-sm font-medium text-gray-900">{staff.nama}</p>
                    <p className="text-xs text-gray-400">{staff.jabatan}</p>
                  </td>
                  {weekDates.map((date) => {
                    const shift = getShift(staff.id, date);
                    const isToday = date === today;
                    return (
                      <td key={date} className={`px-2 py-2.5 text-center ${isToday ? "bg-green-50/40" : ""}`}>
                        <button
                          onClick={() => setEditCell({ staffId: staff.id, staffNama: staff.nama, jabatan: staff.jabatan, date })}
                          className={`inline-flex items-center justify-center w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            shift
                              ? `${SHIFT_STYLE[shift]} hover:opacity-70`
                              : "text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                          }`}
                        >
                          {shift ?? "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: per-staff card */}
        <div className="md:hidden divide-y divide-gray-50">
          {staffMembers.map((staff) => (
            <div key={staff.id} className="px-4 py-4">
              <p className="text-sm font-semibold text-gray-900">{staff.nama}</p>
              <p className="text-xs text-gray-400 mb-3">{staff.jabatan}</p>
              <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, i) => {
                  const shift = getShift(staff.id, date);
                  const isToday = date === today;
                  return (
                    <div key={date} className="flex flex-col items-center gap-1">
                      <span className={`text-[9px] font-semibold uppercase ${isToday ? "text-[#2F855A]" : "text-gray-400"}`}>
                        {HARI_LABEL[i]}
                      </span>
                      <button
                        onClick={() => setEditCell({ staffId: staff.id, staffNama: staff.nama, jabatan: staff.jabatan, date })}
                        className={`w-full text-center text-[9px] font-semibold py-1.5 rounded-lg transition-colors ${
                          shift ? `${SHIFT_STYLE[shift]} hover:opacity-80` : "text-gray-300 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        {shift ? shift.slice(0, 3) : "—"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit shift modal */}
      {editCell && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditCell(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">{editCell.staffNama}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {HARI_LABEL[weekDates.indexOf(editCell.date)]}, {fmtShort(editCell.date)}
                </p>
              </div>
              <button onClick={() => setEditCell(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {SHIFT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelectShift(s)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-colors ${
                    currentShift === s
                      ? SHIFT_BTN_ACTIVE[s]
                      : `${SHIFT_STYLE[s]} hover:opacity-80`
                  }`}
                >
                  {s}
                  {currentShift === s && <span className="ml-1.5 text-xs opacity-80">✓</span>}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setEditCell(null)}
                className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
