"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, Search, AlertTriangle, AlertCircle, Upload, FileImage, Clock } from "lucide-react";
import {
  getPetugasPageData,
  createStaffFromNasabah,
  updateStaffJabatanRole,
  deleteStaffMember,
  type StaffMember,
  type NasabahOption,
  type StaffRole,
} from "@/app/actions/staff";
import { getGajiHistory, uploadGajiBukti, type GajiEntry } from "@/app/actions/gaji";

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "petugas", label: "Petugas" },
  { value: "manajer", label: "Manajer" },
  { value: "admin", label: "Admin" },
];

const BULAN_LABEL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const ROLE_STYLE: Record<StaffRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  manajer: "bg-blue-100 text-blue-700",
  petugas: "bg-green-100 text-green-700",
};

function RoleBadge({ role }: { role: StaffRole }) {
  const label = ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLE[role]}`}>{label}</span>;
}

function nasabahSubtitle(n: { rw?: string | null; rt?: string | null; hp?: string | null }): string {
  const parts: string[] = [];
  if (n.rw && n.rt) parts.push(`RW ${n.rw}/RT ${n.rt}`);
  else if (n.rw) parts.push(`RW ${n.rw}`);
  else if (n.rt) parts.push(`RT ${n.rt}`);
  if (n.hp) parts.push(n.hp);
  return parts.join(" · ");
}

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.ceil((base64.length * 3) / 4);
}

async function compressImageToDataUrl(file: File, maxBytes: number): Promise<{ nama: string; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  let quality = 0.9;
  let dataUrl = "";

  for (let attempt = 0; attempt < 14; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    dataUrl = canvas.toDataURL("image/jpeg", quality);

    if (dataUrlBytes(dataUrl) <= maxBytes || (width <= 80 && height <= 80)) break;

    if (quality > 0.35) quality = Math.max(0.35, quality - 0.1);
    else { width = Math.round(width * 0.8); height = Math.round(height * 0.8); quality = 0.6; }
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return { nama: `${baseName}.jpg`, dataUrl };
}

const EMPTY_FORM = { jabatan: "", role: "petugas" as StaffRole };
type FormData = typeof EMPTY_FORM;

export default function PengurusPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [nasabahList, setNasabahList] = useState<NasabahOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [selectedNasabahId, setSelectedNasabahId] = useState<string | null>(null);
  const [nasabahSearch, setNasabahSearch] = useState("");
  const [nasabahError, setNasabahError] = useState<string | undefined>();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>();

  const [showGajiModal, setShowGajiModal] = useState(false);
  const [gajiTarget, setGajiTarget] = useState<StaffMember | null>(null);
  const [gajiHistory, setGajiHistory] = useState<GajiEntry[]>([]);
  const [gajiLoading, setGajiLoading] = useState(false);
  const [gajiBulan, setGajiBulan] = useState(new Date().getMonth() + 1);
  const [gajiTahun, setGajiTahun] = useState(new Date().getFullYear());
  const [gajiJumlah, setGajiJumlah] = useState(0);
  const [gajiFoto, setGajiFoto] = useState<{ nama: string; dataUrl: string } | null>(null);
  const [gajiFotoErr, setGajiFotoErr] = useState("");
  const [gajiCompressing, setGajiCompressing] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [gajiFormErr, setGajiFormErr] = useState("");
  const [gajiSaving, setGajiSaving] = useState(false);
  const gajiFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { staff: staffRows, nasabah: nasabahRows, error } = await getPetugasPageData();
    setStaff(staffRows);
    setNasabahList(nasabahRows);
    setLoadError(error);
  }

  const eligibleNasabah = useMemo(
    () =>
      nasabahList.filter(
        (n) =>
          !staff.some(
            (s) => s.nasabah_id === n.id || (n.user_id && s.user_id === n.user_id),
          ),
      ),
    [nasabahList, staff],
  );

  const filteredNasabah = useMemo(() => {
    if (!nasabahSearch) return eligibleNasabah;
    const q = nasabahSearch.toLowerCase();
    return eligibleNasabah.filter((n) => n.nama.toLowerCase().includes(q));
  }, [eligibleNasabah, nasabahSearch]);

  const selectedNasabah = useMemo(
    () => eligibleNasabah.find((n) => n.id === selectedNasabahId) ?? null,
    [eligibleNasabah, selectedNasabahId],
  );

  function openAdd() {
    setEditStaff(null);
    setSelectedNasabahId(null);
    setNasabahSearch("");
    setNasabahError(undefined);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(s: StaffMember) {
    setEditStaff(s);
    setForm({ jabatan: s.jabatan, role: s.role });
    setNasabahError(undefined);
    setShowModal(true);
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editStaff && !selectedNasabah) {
      setNasabahError("Pilih nasabah terlebih dahulu");
      return;
    }
    setSaving(true);

    if (editStaff) {
      const { data: row, error } = await updateStaffJabatanRole({
        staffRowId: editStaff.staffRowId,
        userId: editStaff.user_id,
        nama: editStaff.nama,
        rw: editStaff.rw,
        rt: editStaff.rt,
        hp: editStaff.hp,
        jabatan: form.jabatan,
        role: form.role,
      });
      if (row) setStaff((prev) => prev.map((s) => (s.id === editStaff.id ? row : s)));
      else if (error) { setNasabahError(error); setSaving(false); return; }
    } else if (selectedNasabah) {
      const { data: row, error } = await createStaffFromNasabah({
        nasabahId: selectedNasabah.id,
        nama: selectedNasabah.nama,
        rw: selectedNasabah.rw,
        rt: selectedNasabah.rt,
        hp: selectedNasabah.hp,
        userId: selectedNasabah.user_id,
        jabatan: form.jabatan,
        role: form.role,
      });
      if (row) setStaff((prev) => [...prev, row]);
      else if (error) { setNasabahError(error); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    const member = staff.find((s) => s.id === id);
    await deleteStaffMember({
      staffRowId: member?.staffRowId ?? null,
      userId: member?.user_id ?? null,
    });
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  }

  async function openGaji(member: StaffMember) {
    setGajiTarget(member);
    setShowGajiModal(true);
    setGajiFormErr("");
    setGajiFotoErr("");
    setGajiFoto(null);
    if (gajiFileRef.current) gajiFileRef.current.value = "";
    setGajiBulan(new Date().getMonth() + 1);
    setGajiTahun(new Date().getFullYear());
    setGajiJumlah(member.gaji_pokok || 0);
    setGajiHistory([]);
    if (!member.staffRowId) return;
    setGajiLoading(true);
    const { data } = await getGajiHistory(member.staffRowId);
    setGajiHistory(data);
    setGajiLoading(false);
  }

  async function handleGajiFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setGajiFotoErr("Ukuran file maksimal 20 MB"); return; }
    setGajiFotoErr("");
    setGajiCompressing(true);
    try {
      const compressed = await compressImageToDataUrl(file, 50 * 1024);
      setGajiFoto(compressed);
    } catch {
      setGajiFotoErr("Gagal memproses gambar");
    } finally {
      setGajiCompressing(false);
    }
  }

  async function handleUploadGaji(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!gajiTarget?.staffRowId) {
      setGajiFormErr("Lengkapi jabatan petugas ini lewat tombol Edit terlebih dahulu.");
      return;
    }
    if (!gajiFoto) { setGajiFormErr("Foto bukti wajib diunggah"); return; }
    setGajiFormErr("");
    setGajiSaving(true);

    const { data, error } = await uploadGajiBukti({
      staffId: gajiTarget.staffRowId,
      bulan: gajiBulan,
      tahun: gajiTahun,
      jumlah: gajiJumlah,
      gajiPokok: gajiTarget.gaji_pokok,
      fotoNama: gajiFoto.nama,
      fotoDataUrl: gajiFoto.dataUrl,
    });

    if (error) { setGajiFormErr(error); setGajiSaving(false); return; }
    if (data) {
      setGajiHistory((prev) => [data, ...prev.filter((g) => !(g.bulan === data.bulan && g.tahun === data.tahun))]);
    }
    setGajiFoto(null);
    if (gajiFileRef.current) gajiFileRef.current.value = "";
    setGajiSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data & Gaji Pengurus</h1>
          <p className="text-sm text-gray-500">{staff.length} petugas terdaftar</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 bg-[#2F855A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#276749] transition-colors">
          <Plus className="w-4 h-4" /> Tambah Petugas
        </button>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Gagal memuat data: {loadError}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jabatan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RW/RT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">No. HP</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Belum ada petugas.</td></tr>
              )}
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{member.jabatan}</td>
                  <td className="px-4 py-3"><RoleBadge role={member.role} /></td>
                  <td className="px-4 py-3 text-gray-500">RW {member.rw}/RT {member.rt}</td>
                  <td className="px-4 py-3 text-gray-500">{member.hp}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => openEdit(member)} className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteConfirm === member.id ? (
                        <>
                          <button type="button" onClick={() => handleDelete(member.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Konfirmasi hapus"><Check className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setDeleteConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Batal"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(member.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => openGaji(member)} className="inline-flex p-1.5 text-amber-500 hover:bg-amber-50 rounded-full transition-colors" title="Status gaji">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editStaff ? "Edit Petugas" : "Tambah Petugas Baru"}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600" title="Tutup"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {editStaff ? (
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{editStaff.nama}</p>
                  {nasabahSubtitle(editStaff) && (
                    <p className="text-xs text-gray-500 mt-0.5">{nasabahSubtitle(editStaff)}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Nasabah <span className="text-red-500">*</span></label>
                  {selectedNasabah ? (
                    <div className="flex items-center justify-between gap-3 bg-[#F0FFF4] border border-green-200 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedNasabah.nama}</p>
                        {nasabahSubtitle(selectedNasabah) && (
                          <p className="text-xs text-gray-500 mt-0.5">{nasabahSubtitle(selectedNasabah)}</p>
                        )}
                        {!selectedNasabah.user_id && (
                          <p className="text-[11px] text-amber-600 mt-1">Nasabah ini belum punya akun login — peran baru aktif setelah ia mendaftar akun.</p>
                        )}
                      </div>
                      <button type="button" onClick={() => setSelectedNasabahId(null)} className="text-gray-400 hover:text-red-500 shrink-0" title="Ganti nasabah">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          value={nasabahSearch}
                          onChange={(e) => setNasabahSearch(e.target.value)}
                          placeholder="Cari nama nasabah..."
                          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-50">
                        {filteredNasabah.length === 0 ? (
                          <p className="px-3 py-4 text-center text-xs text-gray-400">Tidak ada nasabah yang tersedia.</p>
                        ) : filteredNasabah.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => { setSelectedNasabahId(n.id); setNasabahError(undefined); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900">{n.nama}</p>
                            {nasabahSubtitle(n) && (
                              <p className="text-xs text-gray-400">{nasabahSubtitle(n)}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {nasabahError && <p className="text-xs text-red-500 mt-1">{nasabahError}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
                <input type="text" value={form.jabatan} onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
                  placeholder="Contoh: Ketua, Koordinator Lapangan, dst."
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffRole }))}
                  aria-label="Role akun petugas"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-60">
                  {saving ? "Menyimpan..." : editStaff ? "Simpan Perubahan" : "Tambah Petugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gaji */}
      {showGajiModal && gajiTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-semibold text-gray-900">Gaji — {gajiTarget.nama}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{gajiTarget.jabatan || "Belum ada jabatan"}</p>
              </div>
              <button type="button" onClick={() => setShowGajiModal(false)} className="text-gray-400 hover:text-gray-600" title="Tutup"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {!gajiTarget.staffRowId && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Lengkapi jabatan petugas ini lewat tombol Edit terlebih dahulu sebelum mencatat gaji.</span>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Riwayat Gaji</h3>
                {gajiLoading ? (
                  <p className="text-sm text-gray-400 px-1">Memuat...</p>
                ) : gajiHistory.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-center">
                    <Clock className="w-6 h-6 text-gray-200 mx-auto mb-1.5" />
                    <p className="text-sm text-gray-400">Belum ada riwayat gaji yang diupload.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-50 max-h-56 overflow-y-auto">
                    {gajiHistory.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                        {g.foto_data_url && g.foto_data_url.startsWith("data:image") ? (
                          <img src={g.foto_data_url} alt="bukti gaji" onClick={() => setLightboxUrl(g.foto_data_url)} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0 cursor-pointer hover:opacity-80 transition-opacity" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <FileImage className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{BULAN_LABEL[g.bulan - 1]} {g.tahun}</p>
                          {g.jumlah != null && <p className="text-xs text-gray-400">Rp {g.jumlah.toLocaleString("id")}</p>}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 shrink-0">
                          <Check className="w-3 h-3" /> Sudah
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleUploadGaji} className="space-y-3 border-t border-gray-100 pt-5">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Upload Bukti Gaji</h3>
                {gajiFormErr && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    <X className="w-4 h-4 shrink-0" /> {gajiFormErr}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bulan</label>
                    <select value={gajiBulan} onChange={(e) => setGajiBulan(Number(e.target.value))}
                      aria-label="Bulan gaji"
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]">
                      {BULAN_LABEL.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tahun</label>
                    <input type="number" value={gajiTahun} onChange={(e) => setGajiTahun(Number(e.target.value))}
                      aria-label="Tahun gaji"
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Jumlah (Rp)</label>
                    <input type="number" value={gajiJumlah} onChange={(e) => setGajiJumlah(Number(e.target.value))}
                      aria-label="Jumlah gaji"
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Foto Bukti Pengiriman <span className="text-red-500">*</span></label>
                  {gajiCompressing ? (
                    <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="w-6 h-6 animate-pulse" />
                      <span className="text-sm font-medium">Mengompres gambar...</span>
                    </div>
                  ) : gajiFoto ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {gajiFoto.dataUrl.startsWith("data:image") ? (
                        <img src={gajiFoto.dataUrl} alt="bukti" onClick={() => setLightboxUrl(gajiFoto.dataUrl)} className="w-full max-h-44 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-5 bg-gray-50 justify-center">
                          <FileImage className="w-7 h-7 text-gray-300" />
                          <span className="text-sm text-gray-500">{gajiFoto.nama}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-white">
                        <span className="text-xs text-gray-400 truncate max-w-50">{gajiFoto.nama} · {Math.round(dataUrlBytes(gajiFoto.dataUrl) / 1024)} KB</span>
                        <button type="button" onClick={() => { setGajiFoto(null); if (gajiFileRef.current) gajiFileRef.current.value = ""; }} className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1">
                          <X className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => gajiFileRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#2F855A]/50 hover:text-[#2F855A] transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">Klik untuk upload foto</span>
                      <span className="text-xs">JPG, PNG — otomatis dikompresi ke ~50 KB</span>
                    </button>
                  )}
                  <input ref={gajiFileRef} type="file" accept="image/*" onChange={handleGajiFileChange} className="hidden" title="Upload foto bukti gaji" />
                  {gajiFotoErr && <p className="text-xs text-red-500 mt-1.5">{gajiFotoErr}</p>}
                </div>

                <button type="submit" disabled={gajiSaving || gajiCompressing || !gajiTarget.staffRowId}
                  className="w-full bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] disabled:opacity-60">
                  {gajiSaving ? "Menyimpan..." : "Simpan Bukti Gaji"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <button type="button" onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 text-white/80 hover:text-white" title="Tutup">
            <X className="w-7 h-7" />
          </button>
          <img src={lightboxUrl} alt="Pratinjau bukti" className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
