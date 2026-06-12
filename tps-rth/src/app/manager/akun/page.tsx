"use client";

import { useState, useEffect, useRef } from "react";
import { User, Phone, MapPin, Check, AlertCircle, Camera } from "lucide-react";
import { getSession, updateProfile, type SessionUser } from "@/lib/mockAuth";

type FormState = { nama: string; hp: string; alamat: string };

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SIZE = 256;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      const side = Math.min(img.width, img.height);
      const ox = (img.width - side) / 2;
      const oy = (img.height - side) / 2;
      ctx.drawImage(img, ox, oy, side, side, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ManagerAkunPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [form, setForm] = useState<FormState>({ nama: "", hp: "", alamat: "" });
  const [avatar, setAvatar] = useState("");
  const [errors, setErrors] = useState<Partial<FormState & { general: string }>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSession().then((s) => {
      if (s) {
        setSession(s);
        setForm({ nama: s.nama, hp: s.hp, alamat: s.alamat });
        setAvatar(s.avatar_url ?? "");
      }
    });
  }, []);

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
      if (success) setSuccess("");
    };
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(await compressAvatar(file));
    if (success) setSuccess("");
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.nama.trim() || form.nama.trim().length < 2) errs.nama = "Nama minimal 2 karakter";
    if (!form.hp.trim()) errs.hp = "Nomor HP wajib diisi";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    const { user, error } = await updateProfile({
      nama: form.nama.trim(),
      hp: form.hp.trim(),
      alamat: form.alamat.trim(),
      avatar_url: avatar || undefined,
    });
    if (error) { setErrors({ general: error }); setLoading(false); return; }
    if (user) setSession(user);
    setSuccess("Profil berhasil diperbarui!");
    setLoading(false);
  }

  const inputCls = (field: keyof typeof errors) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
      errors[field] ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-200 bg-white focus:ring-[#2F855A]"
    }`;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-sm text-gray-500">Perbarui informasi profil Anda</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          <Check className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Informasi Profil</h2>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errors.general}
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#2F855A] flex items-center justify-center overflow-hidden ring-4 ring-green-100">
                {avatar
                  ? <img src={avatar} alt="Foto profil" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-white">{session?.nama?.[0] ?? "M"}</span>
                }
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2F855A] text-white flex items-center justify-center shadow-md hover:bg-[#276749] transition-colors"
                title="Ganti foto">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">Klik ikon kamera untuk mengganti foto</p>
            <input ref={fileRef} type="file" accept="image/*" title="Pilih foto profil" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><User className="w-4 h-4" /></div>
              <input value={form.nama} onChange={update("nama")} placeholder="Nama lengkap" className={inputCls("nama")} />
            </div>
            {errors.nama && <p className="mt-1 text-xs text-red-500">⚠ {errors.nama}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor HP <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Phone className="w-4 h-4" /></div>
              <input type="tel" value={form.hp} onChange={update("hp")} placeholder="08xx-xxxx-xxxx" className={inputCls("hp")} />
            </div>
            {errors.hp && <p className="mt-1 text-xs text-red-500">⚠ {errors.hp}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><MapPin className="w-4 h-4" /></div>
              <input value={form.alamat} onChange={update("alamat")} placeholder="Alamat lengkap" className={inputCls("alamat")} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>
    </div>
  );
}
