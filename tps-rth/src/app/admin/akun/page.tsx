"use client";

import { useState, useEffect, useRef } from "react";
import { User, Phone, MapPin, Check, AlertCircle, Camera, LogOut } from "lucide-react";
import { getSession, updateProfile, clearSession, type SessionUser } from "@/lib/mockAuth";
import { useRouter } from "next/navigation";

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
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AdminAkunPage() {
  const router = useRouter();
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
      nama: form.nama.trim(), hp: form.hp.trim(), alamat: form.alamat.trim(),
      avatar_url: avatar || undefined,
    });
    if (error) { setErrors({ general: error }); setLoading(false); return; }
    if (user) setSession(user);
    window.dispatchEvent(new Event("session-updated"));
    setSuccess("Profil berhasil diperbarui!");
    setLoading(false);
  }

  const inputCls = (field: keyof typeof errors) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
      errors[field] ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-200 bg-white focus:ring-[#2F855A]"
    }`;

  return (
    <div className="space-y-6 max-w-3xl">
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

        <form onSubmit={handleSave}>
          <div className="flex flex-col sm:flex-row gap-0">

            {/* Avatar column */}
            <div className="flex flex-col items-center justify-start gap-3 px-8 py-8 sm:border-r border-b sm:border-b-0 border-gray-100 sm:min-w-52">
              <input ref={fileRef} type="file" accept="image/*" title="Pilih foto profil" className="hidden" onChange={handleAvatarChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer"
                title="Ganti foto profil"
              >
                <div className="w-28 h-28 rounded-full bg-[#2F855A] flex items-center justify-center overflow-hidden ring-4 ring-green-100">
                  {avatar
                    ? <img src={avatar} alt="Foto profil" className="w-full h-full object-cover" />
                    : <span className="text-4xl font-bold text-white">{session?.nama?.[0] ?? "A"}</span>
                  }
                </div>
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-[#2F855A] border-2 border-white flex items-center justify-center shadow">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{session?.nama || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Admin</p>
              </div>
            </div>

            {/* Fields column */}
            <div className="flex-1 p-6 space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errors.general}
                </div>
              )}

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

              <div className="pt-2">
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors disabled:opacity-60">
                  {loading ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">Keluar dari Akun</p>
          <p className="text-xs text-gray-400 mt-0.5">Anda akan diarahkan ke halaman login</p>
        </div>
        <button
          type="button"
          onClick={async () => { await clearSession(); router.push("/login"); }}
          className="flex items-center gap-2 text-sm font-semibold text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
