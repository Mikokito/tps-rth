"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Check, Clock } from "lucide-react";
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

  // Add modal
  const [showAdd, setShowAdd]     = useState(false);
  const [addForm, setAddForm]     = useState({ staffId: "", jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "" });
  const [addSaving, setAddSaving] = useState(false);

  // Edit modal
  const [editRow, setEditRow]     = useState<JadwalRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Catatan hari
  const [editingCatatan, setEditingCatatan] = useState(false);
  const [catatanDraft, setCatatanDraft]     = useState("");
  const [catatanSaving, setCatatanSaving]   = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Load ──
  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (session) setManagerId(session.id);

      const supabase = createClient();
      const [{ data: staffData }, { data: jadwalData }] = await Promise.all([
        supabase.from("staff_members")
          .select("id, nama, jabatan")
          .eq("aktif", true)
          .neq("jabatan", "manager")
          .neq("jabatan", "admin")
          .order("nama"),
        supabase.from("jadwal_kerja")
          .select("id, tanggal, staff_id, jam_mulai, jam_selesai, deskripsi, catatan_hari, staff_members(nama, jabatan)")
          .order("tanggal").order("jam_mulai"),
      ]);
      if (staffData) setStaffList(staffData);
      if (jadwalData) setJadwalList(jadwalData as JadwalRow[]);
      setReady(true);
    }
    load();
  }, []);

  // ── Derived ──
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const jadwalByDate = useMemo(() => {
    const map: Record<string, JadwalRow[]> = {};
    jadwalList.forEach((j) => {
      if (!map[j.tanggal]) map[j.tanggal] = [];
      map[j.tanggal].push(j);
    });
    return map;
  }, [jadwalList]);

  const selectedJadwal  = jadwalByDate[selectedDate] ?? [];
  const catatanHariIni  = selectedJadwal[0]?.catatan_hari ?? "";
  const assignedIds     = new Set(selectedJadwal.map((j) => j.staff_id));
  const availableStaff  = staffList.filter((s) => !assignedIds.has(s.id));

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1);
  }

  // ── Buka modal tambah (refresh staff list dulu) ──
  async function openAddModal() {
    const supabase = createClient();
    const { data: fresh } = await supabase.from("staff_members")
      .select("id, nama, jabatan")
      .eq("aktif", true)
      .neq("jabatan", "manager")
      .neq("jabatan", "admin")
      .order("nama");

    const latestStaff = fresh ?? staffList;
    if (fresh) setStaffList(fresh);

    const assignedSet = new Set((jadwalByDate[selectedDate] ?? []).map((j) => j.staff_id));
    const avail = latestStaff.filter((s) => !assignedSet.has(s.id));
    setAddForm({ staffId: avail[0]?.id ?? "", jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "" });
    setShowAdd(true);
  }

  // ── Catatan hari ──
  async function saveCatatan() {
    setCatatanSaving(true);
    const supabase = createClient();
    if (selectedJadwal.length === 0) {
      setCatatanSaving(false);
      setEditingCatatan(false);
      return;
    }
    await Promise.all(
      selectedJadwal.map((j) => supabase.from("jadwal_kerja").update({ catatan_hari: catatanDraft }).eq("id", j.id))
    );
    setJadwalList((prev) => prev.map((j) => j.tanggal === selectedDate ? { ...j, catatan_hari: catatanDraft } : j));
    setCatatanSaving(false);
    setEditingCatatan(false);
  }

  // ── Add jadwal ──
  async function handleAdd() {
    if (!addForm.staffId) return;
    setAddSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("jadwal_kerja").insert({
      tanggal:      selectedDate,
      staff_id:     addForm.staffId,
      jam_mulai:    addForm.jamMulai,
      jam_selesai:  addForm.jamSelesai,
      deskripsi:    addForm.deskripsi || null,
      catatan_hari: catatanHariIni || null,
      dibuat_oleh:  managerId,
    }).select("id").single();

    if (!error && data) {
      const staffInfo = staffList.find((s) => s.id === addForm.staffId);
      const newRow: JadwalRow = {
        id:           data.id,
        tanggal:      selectedDate,
        staff_id:     addForm.staffId,
        jam_mulai:    addForm.jamMulai,
        jam_selesai:  addForm.jamSelesai,
        deskripsi:    addForm.deskripsi || null,
        catatan_hari: catatanHariIni || null,
        staff_members: staffInfo ? { nama: staffInfo.nama, jabatan: staffInfo.jabatan } : null,
      };
      setJadwalList((prev) => [...prev, newRow]);
    }
    setShowAdd(false);
    setAddForm({ staffId: "", jamMulai: "08:00", jamSelesai: "16:00", deskripsi: "" });
    setAddSaving(false);
  }

  // ── Edit jadwal ──
  async function handleSaveEdit() {
    if (!editRow) return;
    setEditSaving(true);
    const supabase = createClient();
    await supabase.from("jadwal_kerja").update({
      jam_mulai:   editRow.jam_mulai,
      jam_selesai: editRow.jam_selesai,
      deskripsi:   editRow.deskripsi || null,
    }).eq("id", editRow.id);
    setJadwalList((prev) => prev.map((j) => j.id === editRow.id ? { ...j, ...editRow } : j));
    setEditRow(null);
    setEditSaving(false);
  }

  // ── Delete jadwal ──
  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("jadwal_kerja").delete().eq("id", id);
    setJadwalList((prev) => prev.filter((j) => j.id !== id));
    setDeleteId(null);
  }

  if (!ready) return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Jadwal Kerja Petugas</h1>
        <p className="text-sm text-gray-500">Kelola jadwal harian petugas secara bulanan</p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4 items-start">

        {/* ── Kalender ── */}
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

        {/* ── Detail tanggal ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[320px]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 capitalize">{fmtFullDate(selectedDate)}</h2>
                {/* Catatan hari */}
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
                        {catatanHariIni || "Belum ada catatan — klik ✎ untuk menambah"}
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

          {/* Staff header */}
          <div className="px-5 py-2.5 flex items-center justify-between bg-gray-50/60 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Petugas Bertugas
              {selectedJadwal.length > 0 && (
                <span className="ml-1.5 bg-[#2F855A] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal">
                  {selectedJadwal.length}
                </span>
              )}
            </p>
            <button type="button" onClick={openAddModal}
              disabled={availableStaff.length === 0}
              className="flex items-center gap-1 text-xs font-semibold text-[#2F855A] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed">
              <Plus className="w-3.5 h-3.5" /> Tambah Petugas
            </button>
          </div>

          {/* Staff list */}
          {selectedJadwal.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
              <CalendarDays className="w-8 h-8 opacity-25" />
              <p className="text-sm">Belum ada petugas yang dijadwalkan</p>
              {availableStaff.length > 0 && (
                <button type="button" onClick={openAddModal}
                  className="text-xs text-[#2F855A] hover:underline font-semibold">+ Tambah Petugas</button>
              )}
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

      {/* ── Modal: Tambah Petugas ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Tambah Petugas</h2>
              <button type="button" onClick={() => setShowAdd(false)} title="Tutup"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Petugas *</label>
                <select
                  value={addForm.staffId}
                  onChange={(e) => setAddForm((f) => ({ ...f, staffId: e.target.value }))}
                  aria-label="Pilih petugas"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] bg-white">
                  {availableStaff.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Mulai *</label>
                  <input type="time" value={addForm.jamMulai} onChange={(e) => setAddForm((f) => ({ ...f, jamMulai: e.target.value }))}
                    title="Jam mulai" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Selesai *</label>
                  <input type="time" value={addForm.jamSelesai} onChange={(e) => setAddForm((f) => ({ ...f, jamSelesai: e.target.value }))}
                    title="Jam selesai" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tugas</label>
                <input value={addForm.deskripsi} onChange={(e) => setAddForm((f) => ({ ...f, deskripsi: e.target.value }))}
                  placeholder="Opsional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="button" onClick={handleAdd} disabled={!addForm.staffId || addSaving}
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-50">
                  {addSaving ? "Menyimpan..." : "Tambah"}
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
                  <input type="time" value={editRow.jam_mulai}
                    onChange={(e) => setEditRow((r) => r ? { ...r, jam_mulai: e.target.value } : r)}
                    title="Jam mulai" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" value={editRow.jam_selesai}
                    onChange={(e) => setEditRow((r) => r ? { ...r, jam_selesai: e.target.value } : r)}
                    title="Jam selesai" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Tugas</label>
                <input value={editRow.deskripsi ?? ""}
                  onChange={(e) => setEditRow((r) => r ? { ...r, deskripsi: e.target.value } : r)}
                  placeholder="Opsional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditRow(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
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
