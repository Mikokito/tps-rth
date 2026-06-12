"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, Send, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, Calendar, FileText } from "lucide-react";
import { getSession } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type Jenis  = "izin" | "cuti";
type Durasi = "setengah_hari" | "sehari";
type Status = "menunggu" | "disetujui" | "ditolak";

type IzinRecord = {
  id: string;
  jenis: Jenis;
  durasi: Durasi | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: Status;
  submitted_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  catatan: string | null;
};

const STATUS_CLS: Record<Status, string> = {
  menunggu:  "bg-amber-50 text-amber-600",
  disetujui: "bg-green-100 text-green-700",
  ditolak:   "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<Status, string> = {
  menunggu: "Menunggu", disetujui: "Disetujui", ditolak: "Ditolak",
};
const STATUS_ICON: Record<Status, React.ReactNode> = {
  menunggu:  <Clock className="w-3 h-3" />,
  disetujui: <CheckCircle className="w-3 h-3" />,
  ditolak:   <XCircle className="w-3 h-3" />,
};

const HARI = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseDateStr(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function diffDays(a: string, b: string) {
  return Math.round((parseDateStr(b).getTime() - parseDateStr(a).getTime()) / 86400000);
}
function fmtDate(s: string) {
  return parseDateStr(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ── Mini Calendar ──────────────────────────────────────────────
function RangeCalendar({
  start, end, onSelect,
}: {
  start: string | null;
  end: string | null;
  onSelect: (date: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDayRaw  = new Date(year, month, 1).getDay(); // 0=Sun
  const firstDayMon  = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // convert to Mon=0

  // Batas navigasi: 6 bulan ke depan dari sekarang
  const maxNavDate   = new Date(now.getFullYear(), now.getMonth() + 6, 1);
  const maxDateStr   = toDateStr(maxNavDate.getFullYear(), maxNavDate.getMonth(), new Date(maxNavDate.getFullYear(), maxNavDate.getMonth() + 1, 0).getDate());
  const atMaxMonth   = year > maxNavDate.getFullYear() || (year === maxNavDate.getFullYear() && month >= maxNavDate.getMonth());
  const atMinMonth   = year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth());

  const cells: (number | null)[] = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function getState(d: number) {
    const ds = toDateStr(year, month, d);
    if (ds < today || ds > maxDateStr) return "past";
    if (start && !end && ds === start) return "start-only";
    if (start && end) {
      if (ds === start) return "start";
      if (ds === end)   return "end";
      if (ds > start && ds < end) return "range";
    }
    if (start && !end && ds > start) {
      const diff = diffDays(start, ds);
      if (diff > 3) return "out-of-range";
    }
    return "normal";
  }

  function prevMonth() {
    if (atMinMonth) return;
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (atMaxMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} title="Bulan sebelumnya" disabled={atMinMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-default">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700">{BULAN[month]} {year}</span>
        <button type="button" onClick={nextMonth} title="Bulan berikutnya" disabled={atMaxMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-default">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {HARI.map((h) => (
          <div key={h} className="text-center text-[11px] font-semibold text-gray-400 py-1">{h}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const ds    = toDateStr(year, month, d);
          const state = getState(d);
          const isToday = ds === today;
          const isPast  = state === "past";
          const isOut   = state === "out-of-range";

          const baseCls = "h-9 w-full flex items-center justify-center text-sm rounded-lg transition-colors font-medium relative";

          const stateCls =
            state === "start" || state === "start-only"
              ? "bg-[#2F855A] text-white"
              : state === "end"
              ? "bg-[#2F855A] text-white"
              : state === "range"
              ? "bg-green-100 text-green-800 rounded-none"
              : isPast || isOut
              ? "text-gray-300 cursor-default"
              : "hover:bg-green-50 text-gray-700 cursor-pointer";

          // round left edge of range start, right edge of range end
          const roundCls =
            state === "start" ? "rounded-r-none" :
            state === "end"   ? "rounded-l-none" : "";

          return (
            <button
              key={ds}
              type="button"
              disabled={isPast || isOut}
              onClick={() => onSelect(ds)}
              className={`${baseCls} ${stateCls} ${roundCls}`}
            >
              {d}
              {isToday && state === "normal" && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2F855A]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function PetugasIzinPage() {
  const today       = new Date().toISOString().slice(0, 10);
  const maxIzinDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [staffId,   setStaffId]   = useState<string | null>(null);
  const [izinList,  setIzinList]  = useState<IzinRecord[]>([]);
  const [ready,     setReady]     = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [sent,      setSent]      = useState(false);

  // Form state
  const [jenis,      setJenis]      = useState<Jenis | null>(null);
  const [durasi,     setDurasi]     = useState<Durasi>("sehari");
  const [tglIzin,   setTglIzin]    = useState(today);
  const [cutiStart,  setCutiStart]  = useState<string | null>(null);
  const [cutiEnd,    setCutiEnd]    = useState<string | null>(null);
  const [alasan,     setAlasan]     = useState("");
  const [formErr,    setFormErr]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) { setReady(true); return; }

      const supabase = createClient();
      const { data: staffRow } = await supabase
        .from("staff_members")
        .select("id")
        .eq("nama", session.nama)
        .maybeSingle();

      const sid = staffRow?.id ?? null;
      setStaffId(sid);

      if (sid) {
        const { data } = await supabase
          .from("izin_cuti")
          .select("id, jenis, durasi, tanggal_mulai, tanggal_selesai, alasan, status, submitted_at, confirmed_at, confirmed_by, catatan")
          .eq("staff_id", sid)
          .order("submitted_at", { ascending: false });
        if (data) setIzinList(data as IzinRecord[]);
      }
      setReady(true);
    }
    init();
  }, []);

  function openForm() {
    setJenis(null);
    setDurasi("sehari");
    setTglIzin(today);
    setCutiStart(null);
    setCutiEnd(null);
    setAlasan("");
    setFormErr("");
    setShowForm(true);
  }

  function handleCalendarSelect(date: string) {
    if (!cutiStart || cutiEnd) {
      // Start fresh selection
      setCutiStart(date);
      setCutiEnd(null);
    } else {
      // Setting end date
      if (date <= cutiStart) {
        // Clicked before start → reset to new start
        setCutiStart(date);
        setCutiEnd(null);
      } else {
        setCutiEnd(date);
      }
    }
  }

  const cutiDays = cutiStart && cutiEnd ? diffDays(cutiStart, cutiEnd) + 1 : null;

  function canSubmit() {
    if (!jenis || !alasan.trim()) return false;
    if (jenis === "izin") return !!tglIzin;
    if (jenis === "cuti") return !!(cutiStart && cutiEnd);
    return false;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit()) { setFormErr("Lengkapi semua data terlebih dahulu"); return; }
    if (!staffId) { setFormErr("Data petugas tidak ditemukan"); return; }

    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("izin_cuti")
      .insert({
        staff_id:        staffId,
        jenis:           jenis!,
        durasi:          jenis === "izin" ? durasi : null,
        tanggal_mulai:   jenis === "izin" ? tglIzin : cutiStart!,
        tanggal_selesai: jenis === "izin" ? tglIzin : cutiEnd!,
        alasan:          alasan.trim(),
        status:          "menunggu",
      })
      .select("id, jenis, durasi, tanggal_mulai, tanggal_selesai, alasan, status, submitted_at, confirmed_at, confirmed_by, catatan")
      .single();

    if (error) {
      setFormErr("Gagal mengirim pengajuan. Silakan coba lagi.");
      setSubmitting(false);
      return;
    }
    if (data) setIzinList((prev) => [data as IzinRecord, ...prev]);

    setSubmitting(false);
    setShowForm(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  const counts = useMemo(() => ({
    total:    izinList.length,
    menunggu: izinList.filter((r) => r.status === "menunggu").length,
    disetujui: izinList.filter((r) => r.status === "disetujui").length,
  }), [izinList]);

  if (!ready) return (
    <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Izin / Cuti</h1>
        <p className="text-sm text-gray-500">Kelola pengajuan izin dan cuti Anda</p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" /> Pengajuan berhasil dikirim! Menunggu konfirmasi supervisor.
        </div>
      )}

      {/* Stats + tombol ajukan */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total",    value: counts.total,    cls: "text-gray-800" },
            { label: "Menunggu", value: counts.menunggu, cls: "text-amber-500" },
            { label: "Disetujui",value: counts.disetujui,cls: "text-green-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-22.5">
              <p className={`text-lg font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={openForm}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#276749] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Ajukan Izin / Cuti
        </button>
      </div>

      {/* Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Riwayat Pengajuan</h2>
        </div>
        {izinList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <FileText className="w-8 h-8 text-gray-200" />
            <p className="text-sm">Belum ada pengajuan izin atau cuti.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {izinList.map((iz) => {
              const isMultiDay = iz.tanggal_mulai !== iz.tanggal_selesai;
              const jenisLabel = iz.jenis === "izin"
                ? iz.durasi === "setengah_hari" ? "Izin Setengah Hari" : "Izin Sehari"
                : "Cuti";
              const tglLabel = isMultiDay
                ? `${fmtDate(iz.tanggal_mulai)} — ${fmtDate(iz.tanggal_selesai)} (${diffDays(iz.tanggal_mulai, iz.tanggal_selesai) + 1} hari)`
                : fmtDate(iz.tanggal_mulai);
              return (
                <div key={iz.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{jenisLabel}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{tglLabel}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CLS[iz.status]}`}>
                      {STATUS_ICON[iz.status]} {STATUS_LABEL[iz.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{iz.alasan}</p>
                  {iz.catatan && iz.status === "ditolak" && (
                    <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-lg">
                      Catatan: {iz.catatan}
                    </p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">
                    Diajukan {new Date(iz.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {iz.confirmed_by && (
                      <> · {iz.status === "disetujui" ? "Disetujui" : "Ditolak"} oleh <span className="font-medium text-gray-400">{iz.confirmed_by}</span></>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL FORM ─────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">
                {!jenis ? "Ajukan Izin / Cuti" : jenis === "izin" ? "Pengajuan Izin" : "Pengajuan Cuti"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors" title="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* ── STEP 1: Pilih jenis ── */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Jenis Pengajuan</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Izin */}
                  <button
                    type="button"
                    onClick={() => setJenis("izin")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      jenis === "izin"
                        ? "border-[#2F855A] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${jenis === "izin" ? "bg-[#2F855A]" : "bg-gray-100"}`}>
                      <Clock className={`w-5 h-5 ${jenis === "izin" ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <span className={`text-sm font-semibold ${jenis === "izin" ? "text-[#2F855A]" : "text-gray-500"}`}>Izin</span>
                    <span className="text-[11px] text-gray-400 text-center leading-tight">Setengah hari atau sehari</span>
                  </button>

                  {/* Cuti */}
                  <button
                    type="button"
                    onClick={() => setJenis("cuti")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      jenis === "cuti"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${jenis === "cuti" ? "bg-blue-500" : "bg-gray-100"}`}>
                      <Calendar className={`w-5 h-5 ${jenis === "cuti" ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <span className={`text-sm font-semibold ${jenis === "cuti" ? "text-blue-600" : "text-gray-500"}`}>Cuti</span>
                    <span className="text-[11px] text-gray-400 text-center leading-tight">Maksimal 4 hari</span>
                  </button>
                </div>
              </div>

              {/* ── STEP 2A: Form Izin ── */}
              {jenis === "izin" && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Durasi</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { val: "setengah_hari" as Durasi, label: "Setengah Hari", desc: "Pagi atau siang" },
                        { val: "sehari"        as Durasi, label: "Sehari Penuh",  desc: "Satu hari kerja" },
                      ]).map(({ val, label, desc }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDurasi(val)}
                          className={`flex flex-col items-start px-4 py-3 rounded-xl border-2 text-left transition-all ${
                            durasi === val
                              ? "border-[#2F855A] bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className={`text-sm font-semibold ${durasi === val ? "text-[#2F855A]" : "text-gray-600"}`}>{label}</span>
                          <span className="text-[11px] text-gray-400 mt-0.5">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tanggal <span className="text-gray-400 font-normal normal-case">(maks. 7 hari ke depan)</span>
                    </label>
                    <input
                      type="date"
                      value={tglIzin}
                      min={today}
                      max={maxIzinDate}
                      onChange={(e) => setTglIzin(e.target.value)}
                      title="Tanggal izin"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                    />
                  </div>
                </>
              )}

              {/* ── STEP 2B: Form Cuti — Kalender ── */}
              {jenis === "cuti" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pilih Tanggal Cuti</p>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <RangeCalendar start={cutiStart} end={cutiEnd} onSelect={handleCalendarSelect} />
                  </div>

                  {/* Info range terpilih */}
                  {cutiStart && (
                    <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      cutiEnd ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
                    }`}>
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {cutiEnd
                        ? <span>{fmtDate(cutiStart)} — {fmtDate(cutiEnd)} <span className="font-bold">({cutiDays} hari)</span></span>
                        : <span>Pilih tanggal selesai (maks. 4 hari dari {fmtDate(cutiStart)})</span>
                      }
                    </div>
                  )}
                  {!cutiStart && (
                    <p className="mt-2 text-xs text-gray-400 text-center">Klik tanggal mulai, lalu klik tanggal selesai</p>
                  )}
                </div>
              )}

              {/* ── Alasan (muncul setelah jenis dipilih) ── */}
              {jenis && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Alasan {jenis === "izin" ? "Izin" : "Cuti"}
                  </label>
                  <textarea
                    value={alasan}
                    onChange={(e) => { setAlasan(e.target.value); setFormErr(""); }}
                    placeholder={`Jelaskan alasan ${jenis === "izin" ? "izin" : "cuti"} Anda...`}
                    rows={3}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none ${formErr ? "border-red-300" : "border-gray-200"}`}
                  />
                  {formErr && <p className="text-xs text-red-500 mt-1">{formErr}</p>}
                </div>
              )}

              {/* ── Tombol ── */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit() || submitting}
                  className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#276749] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
