"use client";

import { useState, useEffect } from "react";
import { Plus, X, Send, Check } from "lucide-react";

type PetugasIzin = {
  id: string;
  jenis: "izin" | "cuti";
  tglMulai: string;
  tglSelesai: string;
  alasan: string;
  status: "pending" | "disetujui" | "ditolak";
  createdAt: string;
};

const IZIN_KEY = "tps_rth_petugas_izin";

const SEED_IZIN: PetugasIzin[] = [
  { id: "pi1", jenis: "izin", tglMulai: "2025-04-27", tglSelesai: "2025-04-27", alasan: "Keperluan keluarga mendesak", status: "disetujui", createdAt: "2025-04-26T20:00:00.000Z" },
  { id: "pi2", jenis: "cuti", tglMulai: "2025-05-10", tglSelesai: "2025-05-12", alasan: "Cuti tahunan",                 status: "pending",   createdAt: "2025-04-28T15:30:00.000Z" },
];

const STATUS_CLS: Record<PetugasIzin["status"], string> = {
  pending:   "bg-gray-100 text-gray-600",
  disetujui: "bg-green-100 text-green-700",
  ditolak:   "bg-red-50 text-red-500",
};

const STATUS_LABEL: Record<PetugasIzin["status"], string> = {
  pending: "Menunggu", disetujui: "Disetujui", ditolak: "Ditolak",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasIzinPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [izinList, setIzinList] = useState<PetugasIzin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ jenis: "izin" as PetugasIzin["jenis"], tglMulai: today, tglSelesai: today, alasan: "" });
  const [formErr, setFormErr] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(IZIN_KEY);
    if (raw) {
      setIzinList(JSON.parse(raw));
    } else {
      localStorage.setItem(IZIN_KEY, JSON.stringify(SEED_IZIN));
      setIzinList(SEED_IZIN);
    }
  }, []);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.alasan.trim()) { setFormErr("Alasan wajib diisi"); return; }
    const now = new Date().toISOString();
    const newIzin: PetugasIzin = {
      id: `pi-${Date.now()}`,
      jenis: form.jenis,
      tglMulai: form.tglMulai,
      tglSelesai: form.tglSelesai,
      alasan: form.alasan.trim(),
      status: "pending",
      createdAt: now,
    };
    const updated = [newIzin, ...izinList];
    setIzinList(updated);
    localStorage.setItem(IZIN_KEY, JSON.stringify(updated));
    setShowForm(false);
    setForm({ jenis: "izin", tglMulai: today, tglSelesai: today, alasan: "" });
    setFormErr("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  const pendingCount = izinList.filter((iz) => iz.status === "pending").length;

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

      {/* Stats + action */}
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
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#276749] transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajukan Izin / Cuti
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Riwayat Pengajuan</h2>
        </div>
        {izinList.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-400">Belum ada pengajuan izin atau cuti.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...izinList].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((iz) => (
              <div key={iz.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800 capitalize">{iz.jenis}</span>
                    <span className="text-xs text-gray-400">
                      {iz.tglMulai === iz.tglSelesai ? iz.tglMulai : `${iz.tglMulai} s/d ${iz.tglSelesai}`}
                    </span>
                  </div>
                  <span className={`inline-flex shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CLS[iz.status]}`}>
                    {STATUS_LABEL[iz.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{iz.alasan}</p>
                <p className="text-xs text-gray-300 mt-1">Diajukan: {fmtDateTime(iz.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Ajukan Izin / Cuti</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis</label>
                <div className="flex gap-3">
                  {(["izin", "cuti"] as const).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, jenis: j }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                        form.jenis === j ? "border-[#2F855A] bg-[#F0FFF4] text-[#2F855A]" : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {j === "izin" ? "Izin" : "Cuti"}
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={form.tglSelesai}
                    onChange={(e) => setForm((f) => ({ ...f, tglSelesai: e.target.value }))}
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