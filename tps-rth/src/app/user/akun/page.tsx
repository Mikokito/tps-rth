"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { getSession, setSession, findByEmail, verifyPassword, hashPassword, type SessionUser } from "@/lib/mockAuth";

type FormState = {
  nama: string;
  email: string;
  hp: string;
  alamat: string;
  passwordLama: string;
  passwordBaru: string;
  passwordConfirm: string;
};

export default function UserAkunPage() {
  const [session, setSessionState] = useState<SessionUser | null>(null);
  const [form, setForm] = useState<FormState>({
    nama: "", email: "", hp: "", alamat: "",
    passwordLama: "", passwordBaru: "", passwordConfirm: "",
  });
  const [showPass, setShowPass] = useState({ lama: false, baru: false, confirm: false });
  const [errors, setErrors] = useState<Partial<FormState & { general: string }>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSessionState(s);
      setForm((f) => ({ ...f, nama: s.nama, email: s.email, hp: s.hp, alamat: s.alamat }));
    }
  }, []);

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
      if (success) setSuccess("");
    };
  }

  function validateProfile() {
    const errs: typeof errors = {};
    if (!form.nama.trim() || form.nama.trim().length < 2) errs.nama = "Nama minimal 2 karakter";
    if (!form.email.trim()) errs.email = "Email wajib diisi";
    if (!form.hp.trim()) errs.hp = "Nomor HP wajib diisi";
    return errs;
  }

  function validatePassword() {
    const errs: typeof errors = {};
    if (!form.passwordLama) errs.passwordLama = "Masukkan password lama";
    if (!form.passwordBaru) errs.passwordBaru = "Masukkan password baru";
    else if (form.passwordBaru.length < 6) errs.passwordBaru = "Password minimal 6 karakter";
    if (form.passwordBaru !== form.passwordConfirm) errs.passwordConfirm = "Konfirmasi password tidak cocok";
    return errs;
  }

  function handleSaveProfile(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    setTimeout(() => {
      if (!session) return;
      const updated: SessionUser = {
        ...session,
        nama: form.nama.trim(),
        email: form.email.trim().toLowerCase(),
        hp: form.hp.trim(),
        alamat: form.alamat.trim(),
      };
      setSession(updated);
      setSessionState(updated);
      setSuccess("Profil berhasil diperbarui!");
      setLoading(false);
    }, 500);
  }

  function handleChangePassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    setTimeout(() => {
      const user = findByEmail(form.email || session?.email || "");
      if (!user || !verifyPassword(form.passwordLama, user.passwordHash)) {
        setErrors({ passwordLama: "Password lama tidak sesuai" });
        setLoading(false);
        return;
      }
      const users = JSON.parse(localStorage.getItem("tps_rth_users") || "[]");
      const updated = users.map((u: { email: string; passwordHash: string }) =>
        u.email === user.email ? { ...u, passwordHash: hashPassword(form.passwordBaru) } : u
      );
      localStorage.setItem("tps_rth_users", JSON.stringify(updated));
      setForm((f) => ({ ...f, passwordLama: "", passwordBaru: "", passwordConfirm: "" }));
      setSuccess("Password berhasil diubah!");
      setLoading(false);
    }, 500);
  }

  const inputCls = (field: keyof typeof errors) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
      errors[field] ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-200 bg-white focus:ring-[#2F855A]"
    }`;

  return (
    <div className="space-y-6 max-w-4xl lg:max-w-full">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-sm text-gray-500">Perbarui informasi profil dan keamanan akun</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          <Check className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="gap-6 grid lg:grid-cols-2 flex-1">
        {/* Profile form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Informasi Profil</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errors.general}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><User className="w-4 h-4" /></div>
                <input value={form.nama} onChange={update("nama")} placeholder="Nama lengkap" className={inputCls("nama")} />
              </div>
              {errors.nama && <p className="mt-1 text-xs text-red-500">⚠ {errors.nama}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Mail className="w-4 h-4" /></div>
                <input type="email" value={form.email} onChange={update("email")} placeholder="email@contoh.com" className={inputCls("email")} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">⚠ {errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nomor HP <span className="text-red-500">*</span>
              </label>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Ubah Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {[
              { field: "passwordLama" as const, label: "Password Lama", key: "lama" as const },
              { field: "passwordBaru" as const, label: "Password Baru", key: "baru" as const },
              { field: "passwordConfirm" as const, label: "Konfirmasi Password Baru", key: "confirm" as const },
            ].map(({ field, label, key }) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Lock className="w-4 h-4" /></div>
                  <input
                    type={showPass[key] ? "text" : "password"}
                    value={form[field]}
                    onChange={update(field)}
                    placeholder={label}
                    className={inputCls(field)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors[field] && <p className="mt-1 text-xs text-red-500">⚠ {errors[field]}</p>}
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white font-semibold py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Ubah Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}