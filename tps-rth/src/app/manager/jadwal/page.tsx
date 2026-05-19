"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Check, Clock } from "lucide-react";
import {
  staffMembers,
  seedJadwalHarian,
  JADWAL_HARIAN_KEY,
  type JadwalHarian,
  type JadwalPetugasItem,
} from "@/data/adminData";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toLocalStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCalendarDays(year: number, month: number): { date: Date; isCurrentMonth: boolean }[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDow = firstOfMonth.getDay(); // 0=Sun
  const start = new Date(year, month, 1 - startDow);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
}

function fmtFullDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const HARI_HEADER = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

type JadwalMap = Record<string, JadwalHarian>;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ManagerJadwalPage() {
  const now = new Date();
  const today = toLocalStr(now);

  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [jadwalMap, setJadwalMap] = useState<JadwalMap>({});

  // Modal: add staff
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ staffId: "", jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "" });

  // Modal: edit staff
  const [editStaff, setEditStaff] = useState<JadwalPetugasItem | null>(null);

  // Inline: task description
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft]     = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Load ──
  useEffect(() => {
    const raw = localStorage.getItem(JADWAL_HARIAN_KEY);
    const arr: JadwalHarian[] = raw ? JSON.parse(raw) : seedJadwalHarian;
    setJadwalMap(Object.fromEntries(arr.map((j) => [j.tanggal, j])));
  }, []);

  function saveMap(map: JadwalMap) {
    setJadwalMap(map);
    localStorage.setItem(JADWAL_HARIAN_KEY, JSON.stringify(Object.values(map)));
  }

  // ── Calendar ──
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }
  function goCurrentMonth() {
    setViewMonth(now.getMonth()); setViewYear(now.getFullYear());
  }

  // ── Selected data ──
  const selectedData = jadwalMap[selectedDate];

  const availableStaff = staffMembers.filter(
    (s) => !selectedData?.petugas.some((p) => p.staffId === s.id)
  );

  // ── Task description ──
  function startEditDesc() {
    setDescDraft(selectedData?.deskripsiTugas ?? "");
    setEditingDesc(true);
  }
  function saveDesc() {
    const existing = jadwalMap[selectedDate];
    const updated: JadwalHarian = existing
      ? { ...existing, deskripsiTugas: descDraft }
      : { tanggal: selectedDate, deskripsiTugas: descDraft, petugas: [] };
    saveMap({ ...jadwalMap, [selectedDate]: updated });
    setEditingDesc(false);
  }

  // ── Add staff ──
  function openAdd() {
    setAddForm({ staffId: availableStaff[0]?.id ?? "", jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "" });
    setShowAdd(true);
  }
  function handleAdd() {
    const staff = staffMembers.find((s) => s.id === addForm.staffId);
    if (!staff) return;
    const newItem: JadwalPetugasItem = {
      id: `jhi-${Date.now()}`,
      staffId: staff.id, namaPetugas: staff.nama, jabatan: staff.jabatan,
      jamMulai: addForm.jamMulai, jamSelesai: addForm.jamSelesai, deskripsi: addForm.deskripsi,
    };
    const existing = jadwalMap[selectedDate];
    const updated: JadwalHarian = existing
      ? { ...existing, petugas: [...existing.petugas, newItem] }
      : { tanggal: selectedDate, deskripsiTugas: "", petugas: [newItem] };
    saveMap({ ...jadwalMap, [selectedDate]: updated });
    setShowAdd(false);
  }

  // ── Remove staff ──
  function handleRemove(itemId: string) {
    const existing = jadwalMap[selectedDate];
    if (!existing) return;
    const petugas = existing.petugas.filter((p) => p.id !== itemId);
    const newMap = { ...jadwalMap };
    if (petugas.length === 0 && !existing.deskripsiTugas) {
      delete newMap[selectedDate];
    } else {
      newMap[selectedDate] = { ...existing, petugas };
    }
    saveMap(newMap);
    setDeleteId(null);
  }

  // ── Edit staff ──
  function handleSaveEdit() {
    if (!editStaff || !jadwalMap[selectedDate]) return;
    const existing = jadwalMap[selectedDate];
    saveMap({
      ...jadwalMap,
      [selectedDate]: { ...existing, petugas: existing.petugas.map((p) => p.id === editStaff.id ? editStaff : p) },
    });
    setEditStaff(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Jadwal Kerja Petugas</h1>
        <p className="text-sm text-gray-500">Kelola jadwal harian petugas secara bulanan</p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4 items-start">

        {/* ── LEFT: Calendar ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{BULAN[viewMonth]} {viewYear}</p>
              {(viewMonth !== now.getMonth() || viewYear !== now.getFullYear()) && (
                <button onClick={goCurrentMonth} className="text-[10px] text-[#2F855A] hover:underline">
                  Bulan ini
                </button>
              )}
            </div>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {HARI_HEADER.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const ds = toLocalStr(date);
              const isToday    = ds === today;
              const isSelected = ds === selectedDate;
              const hasSchedule = !!jadwalMap[ds] && isCurrentMonth;
              return (
                <button
                  key={ds}
                  onClick={() => { setSelectedDate(ds); setEditingDesc(false); setDeleteId(null); }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors
                    ${!isCurrentMonth ? "text-gray-300 cursor-default" : "cursor-pointer"}
                    ${isSelected ? "bg-[#2F855A] text-white" : ""}
                    ${isToday && !isSelected ? "ring-2 ring-[#2F855A] text-[#2F855A] font-bold" : ""}
                    ${isCurrentMonth && !isSelected ? "hover:bg-green-50" : ""}
                  `}
                >
                  {date.getDate()}
                  {hasSchedule && (
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white/70" : "bg-[#2F855A]"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2F855A] inline-block" /> Ada jadwal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-lg ring-2 ring-[#2F855A] inline-flex items-center justify-center text-[9px] text-[#2F855A] font-bold">{now.getDate()}</span>
              Hari ini
            </span>
          </div>
        </div>

        {/* ── RIGHT: Detail ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[320px]">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 capitalize">{fmtFullDate(selectedDate)}</h2>

                {/* Task description */}
                <div className="mt-2">
                  {editingDesc ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        autoFocus
                        value={descDraft}
                        onChange={(e) => setDescDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveDesc(); if (e.key === "Escape") setEditingDesc(false); }}
                        placeholder="Deskripsi tugas hari ini..."
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                      />
                      <button onClick={saveDesc} className="px-3 py-1.5 bg-[#2F855A] text-white text-xs font-semibold rounded-lg hover:bg-[#276749]">Simpan</button>
                      <button onClick={() => setEditingDesc(false)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50">Batal</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group">
                      <p className={`text-sm ${selectedData?.deskripsiTugas ? "text-gray-600" : "text-gray-300 italic"}`}>
                        {selectedData?.deskripsiTugas || "Belum ada deskripsi tugas — klik ✎ untuk mengisi"}
                      </p>
                      <button onClick={startEditDesc} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#2F855A] rounded">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <CalendarDays className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Staff section header */}
          <div className="px-5 py-2.5 flex items-center justify-between bg-gray-50/60 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Petugas Bertugas
              {selectedData && selectedData.petugas.length > 0 && (
                <span className="ml-1.5 bg-[#2F855A] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal">
                  {selectedData.petugas.length}
                </span>
              )}
            </p>
            <button
              onClick={openAdd}
              disabled={availableStaff.length === 0}
              className="flex items-center gap-1 text-xs font-semibold text-[#2F855A] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Petugas
            </button>
          </div>

          {/* Staff list */}
          {!selectedData || selectedData.petugas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
              <CalendarDays className="w-8 h-8 opacity-25" />
              <p className="text-sm">Belum ada petugas yang ditugaskan</p>
              {availableStaff.length > 0 && (
                <button onClick={openAdd} className="text-xs text-[#2F855A] hover:underline font-semibold">+ Tambah Petugas</button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedData.petugas.map((p) => (
                <div key={p.id} className="px-5 py-3.5 flex items-start gap-3 group hover:bg-gray-50/50 transition-colors">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#2F855A]/10 flex items-center justify-center text-[#2F855A] text-xs font-bold shrink-0 mt-0.5">
                    {p.namaPetugas[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{p.namaPetugas}</p>
                      <span className="text-xs text-gray-400">{p.jabatan}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="font-medium">{p.jamMulai} – {p.jamSelesai}</span>
                      {p.deskripsi && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-400 truncate max-w-[200px]">{p.deskripsi}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditStaff({ ...p })}
                      className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteId === p.id ? (
                      <>
                        <button onClick={() => handleRemove(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Add Staff ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Tambah Petugas</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Petugas *</label>
                <select
                  value={addForm.staffId}
                  onChange={(e) => setAddForm((f) => ({ ...f, staffId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                >
                  {availableStaff.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama} — {s.jabatan}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Mulai *</label>
                  <input type="time" value={addForm.jamMulai}
                    onChange={(e) => setAddForm((f) => ({ ...f, jamMulai: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Selesai *</label>
                  <input type="time" value={addForm.jamSelesai}
                    onChange={(e) => setAddForm((f) => ({ ...f, jamSelesai: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tugas</label>
                <input
                  value={addForm.deskripsi}
                  onChange={(e) => setAddForm((f) => ({ ...f, deskripsi: e.target.value }))}
                  placeholder="Opsional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button
                  onClick={handleAdd}
                  disabled={!addForm.staffId}
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-50"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Staff ── */}
      {editStaff && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditStaff(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Edit Jadwal Petugas</h2>
              <button onClick={() => setEditStaff(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2F855A]/10 flex items-center justify-center text-[#2F855A] text-sm font-bold shrink-0">
                  {editStaff.namaPetugas[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{editStaff.namaPetugas}</p>
                  <p className="text-xs text-gray-400">{editStaff.jabatan}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" value={editStaff.jamMulai}
                    onChange={(e) => setEditStaff((s) => s ? { ...s, jamMulai: e.target.value } : s)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" value={editStaff.jamSelesai}
                    onChange={(e) => setEditStaff((s) => s ? { ...s, jamSelesai: e.target.value } : s)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tugas</label>
                <input
                  value={editStaff.deskripsi}
                  onChange={(e) => setEditStaff((s) => s ? { ...s, deskripsi: e.target.value } : s)}
                  placeholder="Opsional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditStaff(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button onClick={handleSaveEdit} className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749]">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
