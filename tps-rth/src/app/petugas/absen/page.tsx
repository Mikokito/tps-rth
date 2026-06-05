"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Calendar, CalendarDays, ChevronLeft, ChevronRight, Pencil, Save, X } from "lucide-react";
import { getSession } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type AbsenStatus = "hadir" | "izin" | "absen";

type AbsenRecord = {
  id: string;
  tanggal: string;
  staff_id: string;
  status: AbsenStatus;
  last_modified: string;
};

const STATUS_CONFIG: Record<AbsenStatus, { label: string; cls: string; icon: React.ReactNode; activeCls: string }> = {
  hadir: {
    label: "Hadir",
    cls: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-4 h-4" />,
    activeCls: "border-green-500 bg-green-50 text-green-700",
  },
  izin: {
    label: "Izin",
    cls: "bg-amber-50 text-amber-600",
    icon: <Clock className="w-4 h-4" />,
    activeCls: "border-amber-400 bg-amber-50 text-amber-600",
  },
  absen: {
    label: "Tidak Hadir",
    cls: "bg-red-50 text-red-500",
    icon: <XCircle className="w-4 h-4" />,
    activeCls: "border-red-400 bg-red-50 text-red-500",
  },
};

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasAbsenPage() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const [staffId, setStaffId]         = useState<string | null>(null);
  const [absenList, setAbsenList]     = useState<AbsenRecord[]>([]);
  const [ready, setReady]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [editStatus, setEditStatus]   = useState<AbsenStatus>("hadir");
  const [isEditing, setIsEditing]     = useState(false);
  const [savedFlash, setSavedFlash]   = useState(false);
  const [rekapBulan, setRekapBulan]   = useState(now.getMonth());
  const [rekapTahun, setRekapTahun]   = useState(now.getFullYear());

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
          .from("absensi")
          .select("id, tanggal, staff_id, status, last_modified")
          .eq("staff_id", sid)
          .order("tanggal", { ascending: false });
        if (data) setAbsenList(data);
      }
      setReady(true);
    }
    init();
  }, []);

  const todayRecord = useMemo(() => absenList.find((a) => a.tanggal === today), [absenList, today]);

  async function handleAbsen(status: AbsenStatus) {
    if (!staffId || saving) return;
    setSaving(true);
    const nowIso = new Date().toISOString();
    const supabase = createClient();

    if (todayRecord) {
      await supabase.from("absensi").update({ status, last_modified: nowIso }).eq("id", todayRecord.id);
      setAbsenList((prev) => prev.map((a) => a.tanggal === today ? { ...a, status, last_modified: nowIso } : a));
    } else {
      const { data } = await supabase.from("absensi").insert({
        tanggal: today, staff_id: staffId, status, last_modified: nowIso,
      }).select("id, tanggal, staff_id, status, last_modified").single();
      if (data) setAbsenList((prev) => [data, ...prev]);
    }

    setIsEditing(false);
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  async function handleEditSave() {
    await handleAbsen(editStatus);
  }

  // ── Rekap bulanan ─────────────────────────────────────────
  const rekapKey = `${rekapTahun}-${String(rekapBulan + 1).padStart(2, "0")}`;
  const bulanRecords = useMemo(
    () => absenList.filter((a) => a.tanggal.startsWith(rekapKey)),
    [absenList, rekapKey]
  );
  const hariHadir  = bulanRecords.filter((a) => a.status === "hadir").length;
  const hariIzin   = bulanRecords.filter((a) => a.status === "izin").length;
  const hariAbsen  = bulanRecords.filter((a) => a.status === "absen").length;
  const totalHari  = bulanRecords.length;
  const pctHadir   = totalHari > 0 ? Math.round((hariHadir / totalHari) * 100) : 0;

  function prevBulan() {
    if (rekapBulan === 0) { setRekapBulan(11); setRekapTahun((y) => y - 1); }
    else setRekapBulan((m) => m - 1);
  }
  function nextBulan() {
    const isCurrentMonth = rekapBulan === now.getMonth() && rekapTahun === now.getFullYear();
    if (isCurrentMonth) return;
    if (rekapBulan === 11) { setRekapBulan(0); setRekapTahun((y) => y + 1); }
    else setRekapBulan((m) => m + 1);
  }

  const historyThisMonth = useMemo(
    () => [...bulanRecords].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [bulanRecords]
  );

  if (!ready) return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;

  const isCurrentMonth = rekapBulan === now.getMonth() && rekapTahun === now.getFullYear();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Absen</h1>
        <p className="text-sm text-gray-500">
          {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {!staffId ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Data petugas tidak ditemukan. Hubungi admin untuk menghubungkan akun.
        </div>
      ) : (
        <>
          {/* ── Absen hari ini ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2F855A]" />
              <h2 className="text-sm font-semibold text-gray-800">Absen Hari Ini</h2>
            </div>

            <div className="p-5">
              {savedFlash && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Absen berhasil dicatat!
                </div>
              )}

              {/* Sudah absen & tidak sedang edit */}
              {todayRecord && !isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${STATUS_CONFIG[todayRecord.status].cls}`}>
                        {STATUS_CONFIG[todayRecord.status].icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{STATUS_CONFIG[todayRecord.status].label}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {fmtDateTime(todayRecord.last_modified)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditStatus(todayRecord.status); setIsEditing(true); }}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Ubah
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                /* Form edit */
                <div className="space-y-4">
                  <p className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-lg">
                    Mengubah absen hari ini
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {(["hadir", "izin", "absen"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditStatus(s)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                          editStatus === s ? STATUS_CONFIG[s].activeCls : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleEditSave} disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#2F855A] text-white hover:bg-[#276749] disabled:opacity-60 transition-colors">
                      <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                      <X className="w-4 h-4" /> Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* Belum absen — tombol utama */
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Pilih status kehadiran Anda hari ini:</p>
                  <div className="flex gap-3 flex-wrap">
                    {(["hadir", "izin", "absen"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAbsen(s)}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-60 ${
                          s === "hadir"
                            ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                            : s === "izin"
                            ? "border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
                        }`}
                      >
                        {STATUS_CONFIG[s].icon}
                        {saving ? "Menyimpan..." : STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Rekap bulanan ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#2F855A]" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Rekap {BULAN[rekapBulan]} {rekapTahun}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={prevBulan} title="Bulan sebelumnya"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 min-w-24 text-center font-medium">
                  {BULAN[rekapBulan].slice(0, 3)} {rekapTahun}
                </span>
                <button type="button" onClick={nextBulan} disabled={isCurrentMonth} title="Bulan berikutnya"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {totalHari === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Belum ada data absen untuk {BULAN[rekapBulan]} {rekapTahun}.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Hari", value: totalHari, cls: "text-gray-700" },
                      { label: "Hadir",      value: hariHadir,  cls: "text-green-600" },
                      { label: "Izin",       value: hariIzin,   cls: "text-amber-500" },
                      { label: "Tidak Hadir", value: hariAbsen, cls: "text-red-500"   },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className={`text-xl font-bold ${cls}`}>{value}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Tingkat Kehadiran</span>
                      <span className={`text-xs font-bold ${pctHadir >= 80 ? "text-green-600" : pctHadir >= 60 ? "text-amber-500" : "text-red-500"}`}>
                        {pctHadir}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pctHadir >= 80 ? "bg-green-500" : pctHadir >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${pctHadir}%` }}
                      />
                    </div>
                  </div>

                  {/* Detail per hari */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 -mx-5 px-5">
                    {historyThisMonth.map((a) => (
                      <div key={a.id} className={`flex items-center justify-between py-2.5 ${a.tanggal === today ? "bg-green-50/50 -mx-5 px-5 rounded" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 font-medium w-24">
                            {new Date(a.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                          {a.tanggal === today && <span className="text-[10px] text-[#2F855A] font-semibold">Hari ini</span>}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[a.status].cls}`}>
                          {STATUS_CONFIG[a.status].icon}
                          {STATUS_CONFIG[a.status].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
