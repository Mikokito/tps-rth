"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Trash2, X, Check, Clock, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSession } from "@/lib/mockAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

type StaffMember = { id: string; nama: string; jabatan: string };

type JadwalRow = {
  id: string;
  tanggal: string;
  staff_id: string;
  jam_mulai: string;
  jam_selesai: string;
  deskripsi: string | null;
  catatan_hari: string | null;
  staff_members: { nama: string; jabatan: string } | null;
};

type SchedModal = {
  viewMonth: number; viewYear: number;
  selectedDates: string[];
  jamMulai: string; jamSelesai: string; deskripsi: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toLocalStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCalendarDays(year: number, month: number) {
  const startDow = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - startDow);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
}

function fmtFullDate(ds: string) {
  return new Date(ds + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const HARI  = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerJadwalPage() {
  const now   = new Date();
  const today = toLocalStr(now);

  const [viewMonth, setViewMonth]         = useState(now.getMonth());
  const [viewYear, setViewYear]           = useState(now.getFullYear());
  const [selectedDate, setSelectedDate]   = useState(today);
  const [staffList, setStaffList]         = useState<StaffMember[]>([]);
  const [jadwalList, setJadwalList]       = useState<JadwalRow[]>([]);
  const [managerId, setManagerId]         = useState<string | null>(null);
  const [ready, setReady]                 = useState(false);

  // Edit modal
  const [editRow, setEditRow]         = useState<JadwalRow | null>(null);
  const [editSaving, setEditSaving]   = useState(false);

  // Catatan hari
  const [editingCatatan, setEditingCatatan] = useState(false);
  const [catatanDraft, setCatatanDraft]     = useState("");
  const [catatanSaving, setCatatanSaving]   = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Jadwalkan modal
  const [scheduleStaff, setScheduleStaff] = useState<StaffMember | null>(null);
  const [sched, setSched] = useState<SchedModal>({
    viewMonth: now.getMonth(), viewYear: now.getFullYear(),
    selectedDates: [], jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "",
  });
  const [schedSaving, setSchedSaving] = useState(false);
  const [schedError, setSchedError] = useState<string | null>(null);

  // ── Load ──
  useEffect(() => {
    async function load() {
      try {
        const session = await getSession();
        if (session) setManagerId(session.id);

        const supabase = createClient();
        const [{ data: staffData }, { data: jadwalData }] = await Promise.all([
          supabase.from("staff_members")
            .select("id, nama, jabatan")
            .neq("jabatan", "manager")
            .neq("jabatan", "admin")
            .order("nama"),
          supabase.from("jadwal_kerja")
            .select("id, tanggal, staff_id, jam_mulai, jam_selesai, deskripsi, catatan_hari, staff_members(nama, jabatan)")
            .order("tanggal").order("jam_mulai"),
        ]);
        if (staffData) setStaffList(staffData);
        if (jadwalData) setJadwalList(jadwalData as unknown as JadwalRow[]);
      } catch (err) {
        console.error("Gagal memuat jadwal:", err);
      } finally {
        setReady(true);
      }
    }
    load();
  }, []);

  // ── Derived ──
  const calendarDays      = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const modalCalendarDays = useMemo(() => getCalendarDays(sched.viewYear, sched.viewMonth), [sched.viewYear, sched.viewMonth]);

  const jadwalByDate = useMemo(() => {
    const map: Record<string, JadwalRow[]> = {};
    jadwalList.forEach((j) => {
      if (!map[j.tanggal]) map[j.tanggal] = [];
      map[j.tanggal].push(j);
    });
    return map;
  }, [jadwalList]);

  const selectedJadwal = jadwalByDate[selectedDate] ?? [];
  const catatanHariIni = selectedJadwal[0]?.catatan_hari ?? "";

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1);
  }

  // ── Jadwalkan modal ──
  function openSchedule(staff: StaffMember) {
    setScheduleStaff(staff);
    setSchedError(null);
    setSched({
      viewMonth: now.getMonth(), viewYear: now.getFullYear(),
      selectedDates: [], jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "",
    });
  }

  function toggleSchedDate(ds: string) {
    setSched((m) => ({
      ...m,
      selectedDates: m.selectedDates.includes(ds)
        ? m.selectedDates.filter((d) => d !== ds)
        : [...m.selectedDates, ds],
    }));
  }

  async function handleSaveSchedule() {
    if (!scheduleStaff || sched.selectedDates.length === 0) return;
    setSchedSaving(true);
    setSchedError(null);
    try {
      const supabase = createClient();
      const rows = sched.selectedDates.map((tanggal) => ({
        tanggal,
        staff_id:    scheduleStaff.id,
        jam_mulai:   sched.jamMulai,
        jam_selesai: sched.jamSelesai,
        deskripsi:   sched.deskripsi || null,
        dibuat_oleh: managerId,
      }));
      const { data, error } = await supabase.from("jadwal_kerja").insert(rows).select("id, tanggal");
      if (error) {
        setSchedError(error.message);
        return;
      }
      if (data) {
        const newRows: JadwalRow[] = data.map((d) => ({
          id:            d.id,
          tanggal:       d.tanggal,
          staff_id:      scheduleStaff.id,
          jam_mulai:     sched.jamMulai,
          jam_selesai:   sched.jamSelesai,
          deskripsi:     sched.deskripsi || null,
          catatan_hari:  null,
          staff_members: { nama: scheduleStaff.nama, jabatan: scheduleStaff.jabatan },
        }));
        setJadwalList((prev) => [...prev, ...newRows]);
      }
      setScheduleStaff(null);
    } catch (err) {
      setSchedError(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
    } finally {
      setSchedSaving(false);
    }
  }

  // ── Catatan hari ──
  async function saveCatatan() {
    if (selectedJadwal.length === 0) { setEditingCatatan(false); return; }
    setCatatanSaving(true);
    try {
      const supabase = createClient();
      await Promise.all(
        selectedJadwal.map((j) => supabase.from("jadwal_kerja").update({ catatan_hari: catatanDraft }).eq("id", j.id))
      );
      setJadwalList((prev) => prev.map((j) => j.tanggal === selectedDate ? { ...j, catatan_hari: catatanDraft } : j));
      setEditingCatatan(false);
    } catch (err) {
      console.error("Gagal menyimpan catatan:", err);
    } finally {
      setCatatanSaving(false);
    }
  }

  // ── Edit jadwal ──
  async function handleSaveEdit() {
    if (!editRow) return;
    setEditSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("jadwal_kerja").update({
        jam_mulai:   editRow.jam_mulai,
        jam_selesai: editRow.jam_selesai,
        deskripsi:   editRow.deskripsi || null,
      }).eq("id", editRow.id);
      setJadwalList((prev) => prev.map((j) => j.id === editRow.id ? { ...j, ...editRow } : j));
      setEditRow(null);
    } catch (err) {
      console.error("Gagal menyimpan edit:", err);
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete jadwal ──
  async function handleDelete(id: string) {
    try {
      const supabase = createClient();
      await supabase.from("jadwal_kerja").delete().eq("id", id);
      setJadwalList((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Gagal menghapus jadwal:", err);
    } finally {
      setDeleteId(null);
    }
  }

  if (!ready) return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Jadwal Kerja Petugas</h1>
        <p className="text-sm text-gray-500">Kelola jadwal harian petugas secara bulanan</p>
      </div>

      {/* ── Kalender + Detail tanggal ── */}
      <div className="grid md:grid-cols-[320px_1fr] gap-4 items-start">

        {/* Kalender */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 w-full max-w-sm mx-auto md:max-w-none md:mx-0">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} title="Bulan sebelumnya" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{BULAN[viewMonth]} {viewYear}</p>
              {(viewMonth !== now.getMonth() || viewYear !== now.getFullYear()) && (
                <button type="button" onClick={() => { setViewMonth(now.getMonth()); setViewYear(now.getFullYear()); }}
                  className="text-[10px] text-[#2F855A] hover:underline">Bulan ini</button>
              )}
            </div>
            <button type="button" onClick={nextMonth} title="Bulan berikutnya" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {HARI.map((d) => <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const ds         = toLocalStr(date);
              const isToday    = ds === today;
              const isSelected = ds === selectedDate;
              const hasJadwal  = !!jadwalByDate[ds] && isCurrentMonth;
              return (
                <button
                  key={ds}
                  type="button"
                  onClick={() => { if (isCurrentMonth) { setSelectedDate(ds); setEditingCatatan(false); setDeleteId(null); } }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors
                    ${!isCurrentMonth ? "text-gray-300 cursor-default" : "cursor-pointer"}
                    ${isSelected ? "bg-[#2F855A] text-white" : ""}
                    ${isToday && !isSelected ? "ring-2 ring-[#2F855A] text-[#2F855A] font-bold" : ""}
                    ${isCurrentMonth && !isSelected ? "hover:bg-green-50" : ""}
                  `}
                >
                  {date.getDate()}
                  {hasJadwal && <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white/70" : "bg-[#2F855A]"}`} />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2F855A] inline-block" /> Ada jadwal</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-lg ring-2 ring-[#2F855A] inline-flex items-center justify-center text-[9px] text-[#2F855A] font-bold">{now.getDate()}</span>
              Hari ini
            </span>
          </div>
        </div>

        {/* Detail tanggal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-80">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 capitalize">{fmtFullDate(selectedDate)}</h2>
                <div className="mt-2">
                  {editingCatatan ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input autoFocus value={catatanDraft}
                        onChange={(e) => setCatatanDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveCatatan(); if (e.key === "Escape") setEditingCatatan(false); }}
                        placeholder="Catatan tugas hari ini..."
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                      />
                      <button type="button" onClick={saveCatatan} disabled={catatanSaving}
                        className="px-3 py-1.5 bg-[#2F855A] text-white text-xs font-semibold rounded-lg hover:bg-[#276749] disabled:opacity-60">
                        {catatanSaving ? "..." : "Simpan"}
                      </button>
                      <button type="button" onClick={() => setEditingCatatan(false)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50">Batal</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group">
                      <p className={`text-sm ${catatanHariIni ? "text-gray-600" : "text-gray-300 italic"}`}>
                        {catatanHariIni || "Belum ada catatan"}
                      </p>
                      {selectedJadwal.length > 0 && (
                        <button type="button" onClick={() => { setCatatanDraft(catatanHariIni); setEditingCatatan(true); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#2F855A] rounded" title="Edit catatan">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <CalendarDays className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Petugas bertugas header */}
          <div className="px-5 py-2.5 bg-gray-50/60 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Petugas Bertugas
              {selectedJadwal.length > 0 && (
                <span className="ml-1.5 bg-[#2F855A] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal">
                  {selectedJadwal.length}
                </span>
              )}
            </p>
          </div>

          {/* Petugas list */}
          {selectedJadwal.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
              <CalendarDays className="w-8 h-8 opacity-25" />
              <p className="text-sm">Belum ada petugas yang dijadwalkan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedJadwal.map((j) => (
                <div key={j.id} className="px-5 py-3.5 flex items-start gap-3 group hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#2F855A]/10 flex items-center justify-center text-[#2F855A] text-xs font-bold shrink-0 mt-0.5">
                    {j.staff_members?.nama?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{j.staff_members?.nama ?? "—"}</p>
                      <span className="text-xs text-gray-400">{j.staff_members?.jabatan ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="font-medium">{j.jam_mulai.slice(0,5)} – {j.jam_selesai.slice(0,5)}</span>
                      {j.deskripsi && <><span className="text-gray-300">·</span><span className="text-gray-400 truncate max-w-48">{j.deskripsi}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setEditRow({ ...j })} title="Edit" className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteId === j.id ? (
                      <>
                        <button type="button" title="Konfirmasi hapus" onClick={() => handleDelete(j.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button type="button" title="Batal" onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <button type="button" title="Hapus" onClick={() => setDeleteId(j.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* ── Tabel Daftar Petugas ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Daftar Petugas</h2>
          <p className="text-xs text-gray-400 mt-0.5">Klik Jadwalkan untuk mengatur jadwal kerja petugas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jabatan</th>
                <th className="px-5 py-3 w-32 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2F855A]/10 flex items-center justify-center text-[#2F855A] text-xs font-bold shrink-0">
                        {staff.nama[0]}
                      </div>
                      <span className="font-medium text-gray-900">{staff.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 capitalize">
                      {staff.jabatan || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openSchedule(staff)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2F855A] hover:bg-[#276749] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Jadwalkan
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                    Belum ada data petugas aktif
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Jadwalkan Petugas ── */}
      {scheduleStaff && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setScheduleStaff(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Jadwalkan Petugas</h2>
                <p className="text-xs text-gray-500 mt-0.5">{scheduleStaff.nama} · {scheduleStaff.jabatan}</p>
              </div>
              <button type="button" onClick={() => setScheduleStaff(null)} title="Tutup">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">

              {/* Kalender multi-select */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Pilih Tanggal Bertugas
                  <span className="text-gray-400 font-normal ml-1">(bisa lebih dari satu)</span>
                </p>
                <div className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <button type="button" title="Bulan sebelumnya"
                      onClick={() => setSched((m) => m.viewMonth === 0
                        ? { ...m, viewMonth: 11, viewYear: m.viewYear - 1 }
                        : { ...m, viewMonth: m.viewMonth - 1 })}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs font-bold text-gray-900">{BULAN[sched.viewMonth]} {sched.viewYear}</span>
                    <button type="button" title="Bulan berikutnya"
                      onClick={() => setSched((m) => m.viewMonth === 11
                        ? { ...m, viewMonth: 0, viewYear: m.viewYear + 1 }
                        : { ...m, viewMonth: m.viewMonth + 1 })}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {HARI.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {modalCalendarDays.map(({ date, isCurrentMonth }) => {
                      const ds         = toLocalStr(date);
                      const isSelected = sched.selectedDates.includes(ds);
                      const isToday    = ds === today;
                      return (
                        <button
                          key={ds}
                          type="button"
                          onClick={() => { if (isCurrentMonth) toggleSchedDate(ds); }}
                          className={`aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium transition-colors
                            ${!isCurrentMonth ? "text-gray-200 cursor-default" : "cursor-pointer"}
                            ${isSelected ? "bg-[#2F855A] text-white" : ""}
                            ${isToday && !isSelected ? "ring-1 ring-[#2F855A] text-[#2F855A] font-bold" : ""}
                            ${isCurrentMonth && !isSelected ? "hover:bg-green-50" : ""}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {sched.selectedDates.length > 0 ? (
                  <p className="text-xs text-[#2F855A] mt-1.5 font-medium">{sched.selectedDates.length} tanggal dipilih</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1.5">Belum ada tanggal dipilih</p>
                )}
              </div>

              {/* Jam kerja */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Mulai <span className="text-red-500">*</span></label>
                  <input type="time" value={sched.jamMulai} title="Jam mulai"
                    onChange={(e) => setSched((m) => ({ ...m, jamMulai: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Selesai <span className="text-red-500">*</span></label>
                  <input type="time" value={sched.jamSelesai} title="Jam selesai"
                    onChange={(e) => setSched((m) => ({ ...m, jamSelesai: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tugas</label>
                <input value={sched.deskripsi}
                  onChange={(e) => setSched((m) => ({ ...m, deskripsi: e.target.value }))}
                  placeholder="Opsional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
              </div>

              {schedError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                  <span className="font-semibold">Gagal:</span> {schedError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setScheduleStaff(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">
                  Batal
                </button>
                <button type="button" onClick={handleSaveSchedule}
                  disabled={sched.selectedDates.length === 0 || schedSaving}
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-50 transition-colors">
                  {schedSaving ? "Menyimpan..." : sched.selectedDates.length > 0 ? `Simpan (${sched.selectedDates.length} hari)` : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Jadwal ── */}
      {editRow && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditRow(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Edit Jadwal</h2>
              <button type="button" onClick={() => setEditRow(null)} title="Tutup"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2F855A]/10 flex items-center justify-center text-[#2F855A] text-sm font-bold shrink-0">
                  {editRow.staff_members?.nama?.[0] ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{editRow.staff_members?.nama ?? "—"}</p>
                  <p className="text-xs text-gray-400">{editRow.staff_members?.jabatan ?? "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" value={editRow.jam_mulai} title="Jam mulai"
                    onChange={(e) => setEditRow((r) => r ? { ...r, jam_mulai: e.target.value } : r)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" value={editRow.jam_selesai} title="Jam selesai"
                    onChange={(e) => setEditRow((r) => r ? { ...r, jam_selesai: e.target.value } : r)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tugas</label>
                <input value={editRow.deskripsi ?? ""}
                  onChange={(e) => setEditRow((r) => r ? { ...r, deskripsi: e.target.value } : r)}
                  placeholder="Opsional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditRow(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="button" onClick={handleSaveEdit} disabled={editSaving}
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-60">
                  {editSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
