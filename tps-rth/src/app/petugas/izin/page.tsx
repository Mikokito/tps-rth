"use client";

import { useState, useEffect } from "react";
import { Plus, X, Send, Check } from "lucide-react";
import { getSession } from "@/lib/mockAuth";
import { createClient } from "@/utils/supabase/client";

type IzinRecord = {
  id: string;
  staff_id: string;
  nama_petugas: string;
  jabatan: string;
  jenis: "Izin" | "Cuti";
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: "menunggu" | "disetujui" | "ditolak";
  diajukan_pada: string;
};

const STATUS_CLS: Record<IzinRecord["status"], string> = {
  menunggu:  "bg-gray-100 text-gray-600",
  disetujui: "bg-green-100 text-green-700",
  ditolak:   "bg-red-50 text-red-500",
};

const STATUS_LABEL: Record<IzinRecord["status"], string> = {
  menunggu: "Menunggu", disetujui: "Disetujui", ditolak: "Ditolak",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasIzinPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffNama, setStaffNama] = useState("");
  const [staffJabatan, setStaffJabatan] = useState("");
  const [izinList, setIzinList] = useState<IzinRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ jenis: "Izin" as "Izin" | "Cuti", tglMulai: today, tglSelesai: today, alasan: "" });
  const [formErr, setFormErr] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) { setReady(true); return; }

      setStaffNama(session.nama);
      setStaffJabatan(session.jabatan ?? "");

      const supabase = createClient();
      const { data: staffRow } = await supabase
        .from("staff_members")
        .select("id, jabatan")
        .eq("nama", session.nama)
        .maybeSingle();

      const sid = staffRow?.id ?? null;
      setStaffId(sid);
      if (staffRow?.jabatan) setStaffJabatan(staffRow.jabatan);

      if (sid) {
        const { data } = await supabase
          .from("izin_cuti")
          .select("id, staff_id, nama_petugas, jabatan, jenis, tanggal_mulai, tanggal_selesai, alasan, status, diajukan_pada")
          .eq("staff_id", sid)
          .order("diajukan_pada", { ascending: false });
        if (data) setIzinList(data);
      }
      setReady(true);
    }
    init();
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.alasan.trim()) { setFormErr("Alasan wajib diisi"); return; }
    if (!staffId) { setFormErr("Data petugas tidak ditemukan"); return; }

    const supabase = createClient();
    const { data } = await supabase.from("izin_cuti").insert({
      staff_id: staffId,
      nama_petugas: staffNama,
      jabatan: staffJabatan,
      jenis: form.jenis,
      tanggal_mulai: form.tglMulai,
      tanggal_selesai: form.tglSelesai,
      alasan: form.alasan.trim(),
      status: "menunggu",
      diajukan_pada: new Date().toISOString(),
    }).select("id, staff_id, nama_petugas, jabatan, jenis, tanggal_mulai, tanggal_selesai, alasan, status, diajukan_pada").single();

    if (data) setIzinList((prev) => [data, ...prev]);
    setShowForm(false);
    setForm({ jenis: "Izin", tglMulai: today, tglSelesai: today, alasan: "" });
    setFormErr("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  const pendingCount = izinList.filter((iz) => iz.status === "menunggu").length;

  if (!ready) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Izin / Cuti</h1>
        <p className="text-sm text-gray-500">Kelola pengajuan izin dan cuti Anda</p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          <Check className="w-4 h-4 shrink-0" /> Pengajuan berhasil dikirim!
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3 flex-wrap">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[100px]">
            <p className="text-lg font-bold text-gray-900">{izinList.length}</p>
            <p className="text-xs text-gray-400">Total Pengajuan</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[100px]">
            <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-gray-400">Menunggu</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[100px]">
            <p className="text-lg font-bold text-green-600">{izinList.filter((iz) => iz.status === "disetujui").length}</p>
            <p className="text-xs text-gray-400">Disetujui</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#276749] transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajukan Izin / Cuti
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Riwayat Pengajuan</h2>
        </div>
        {izinList.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-400">Belum ada pengajuan izin atau cuti.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {izinList.map((iz) => (
              <div key={iz.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{iz.jenis}</span>
                    <span className="text-xs text-gray-400">
                      {iz.tanggal_mulai === iz.tanggal_selesai
                        ? iz.tanggal_mulai
                        : `${iz.tanggal_mulai} s/d ${iz.tanggal_selesai}`}
                    </span>
                  </div>
                  <span className={`inline-flex shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CLS[iz.status]}`}>
                    {STATUS_LABEL[iz.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{iz.alasan}</p>
                <p className="text-xs text-gray-300 mt-1">Diajukan: {fmtDateTime(iz.diajukan_pada)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Ajukan Izin / Cuti</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" title="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis</label>
                <div className="flex gap-3">
                  {(["Izin", "Cuti"] as const).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, jenis: j }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                        form.jenis === j ? "border-[#2F855A] bg-[#F0FFF4] text-[#2F855A]" : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={form.tglMulai}
                    onChange={(e) => setForm((f) => ({ ...f, tglMulai: e.target.value }))}
                    title="Tanggal mulai"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={form.tglSelesai}
                    onChange={(e) => setForm((f) => ({ ...f, tglSelesai: e.target.value }))}
                    title="Tanggal selesai"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alasan *</label>
                <textarea
                  value={form.alasan}
                  onChange={(e) => { setForm((f) => ({ ...f, alasan: e.target.value })); setFormErr(""); }}
                  placeholder="Jelaskan alasan pengajuan..."
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A] resize-none ${formErr ? "border-red-300" : "border-gray-200"}`}
                />
                {formErr && <p className="text-xs text-red-500 mt-1">{formErr}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
