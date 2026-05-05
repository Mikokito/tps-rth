"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { getSession, setSession, findByEmail, verifyPassword, hashPassword, type SessionUser } from "@/lib/mockAuth";

type ProfileForm = { nama: string; email: string; hp: string; alamat: string; jabatan: string };
type PasswordForm = { passwordLama: string; passwordBaru: string; passwordConfirm: string };

export default function PetugasAkunPage() {
  const [session, setSessionState] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<ProfileForm>({ nama: "", email: "", hp: "", alamat: "", jabatan: "" });
  const [pass, setPass] = useState<PasswordForm>({ passwordLama: "", passwordBaru: "", passwordConfirm: "" });
  const [showPass, setShowPass] = useState({ lama: false, baru: false, confirm: false });
  const [profileErr, setProfileErr] = useState<Partial<ProfileForm>>({});
  const [passErr, setPassErr] = useState<Partial<PasswordForm & { general: string }>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSessionState(s);
      setProfile({ nama: s.nama, email: s.email, hp: s.hp, alamat: s.alamat, jabatan: s.jabatan ?? "" });
    }
  }, []);

  function updateProfile(field: keyof ProfileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile((f) => ({ ...f, [field]: e.target.value }));
      if (profileErr[field]) setProfileErr((er) => ({ ...er, [field]: undefined }));
      if (success) setSuccess("");
    };
  }

  function updatePass(field: keyof PasswordForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPass((f) => ({ ...f, [field]: e.target.value }));
      if (passErr[field]) setPassErr((er) => ({ ...er, [field]: undefined }));
      if (success) setSuccess("");
    };
  }

  function validateProfile() {
    const errs: Partial<ProfileForm> = {};
    if (!profile.nama.trim() || profile.nama.trim().length < 2) errs.nama = "Nama minimal 2 karakter";
    if (!profile.email.trim()) errs.email = "Email wajib diisi";
    if (!profile.hp.trim()) errs.hp = "Nomor HP wajib diisi";
    return errs;
  }

  function validatePass() {
    const errs: typeof passErr = {};
    if (!pass.passwordLama) errs.passwordLama = "Masukkan password lama";
    if (!pass.passwordBaru) errs.passwordBaru = "Masukkan password baru";
    else if (pass.passwordBaru.length < 6) errs.passwordBaru = "Password minimal 6 karakter";
    if (pass.passwordBaru !== pass.passwordConfirm) errs.passwordConfirm = "Konfirmasi tidak cocok";
    return errs;
  }

  function handleSaveProfile(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErr(errs); return; }
    setLoading(true);
    setTimeout(() => {
      if (!session) return;
      const updated: SessionUser = {
        ...session,
        nama: profile.nama.trim(),
        email: profile.email.trim().toLowerCase(),
        hp: profile.hp.trim(),
        alamat: profile.alamat.trim(),
        jabatan: profile.jabatan.trim(),
      };
      setSession(updated);
      setSessionState(updated);
      setSuccess("Profil berhasil diperbarui!");
      setLoading(false);
    }, 500);
  }

  function handleChangePassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validatePass();
    if (Object.keys(errs).length > 0) { setPassErr(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const user = findByEmail(profile.email || session?.email || "");
      if (!user || !verifyPassword(pass.passwordLama, user.passwordHash)) {
        setPassErr({ passwordLama: "Password lama tidak sesuai" });
        setLoading(false);
        return;
      }
      const users = JSON.parse(localStorage.getItem("tps_rth_users") || "[]");
      const updated = users.map((u: { email: string; passwordHash: string }) =>
        u.email === user.email ? { ...u, passwordHash: hashPassword(pass.passwordBaru) } : u
      );
      localStorage.setItem("tps_rth_users", JSON.stringify(updated));
      setPass({ passwordLama: "", passwordBaru: "", passwordConfirm: "" });
      setSuccess("Password berhasil diubah!");
      setLoading(false);
    }, 500);
  }

  const inputCls = (err?: string) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
      err ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-200 bg-white focus:ring-[#2F855A]"
    }`;

  return (
    <div className="space-y-6 max-w-4xl lg:max-w-full">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-sm text-gray-500">Perbarui informasi profil dan keamanan akun</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          <Check className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Informasi Profil</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            {[
              { field: "nama" as const,    label: "Nama Lengkap", icon: <User className="w-4 h-4" />,     type: "text",  required: true },
              { field: "email" as const,   label: "Email",        icon: <Mail className="w-4 h-4" />,     type: "email", required: true },
              { field: "hp" as const,      label: "Nomor HP",     icon: <Phone className="w-4 h-4" />,    type: "tel",   required: true },
              { field: "jabatan" as const, label: "Jabatan",      icon: <Briefcase className="w-4 h-4" />,type: "text",  required: false },
              { field: "alamat" as const,  label: "Alamat",       icon: <MapPin className="w-4 h-4" />,   type: "text",  required: false },
            ].map(({ field, label, icon, type, required }) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>
                  <input
                    type={type}
                    value={profile[field]}
                    onChange={updateProfile(field)}
                    placeholder={label}
                    className={inputCls(profileErr[field])}
                  />
                </div>
                {profileErr[field] && <p className="mt-1 text-xs text-red-500">⚠ {profileErr[field]}</p>}
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Ubah Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {passErr.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" /> {passErr.general}
              </div>
            )}
            {([
              { field: "passwordLama" as const, label: "Password Lama",           key: "lama" as const },
              { field: "passwordBaru" as const, label: "Password Baru",           key: "baru" as const },
              { field: "passwordConfirm" as const, label: "Konfirmasi Password",  key: "confirm" as const },
            ]).map(({ field, label, key }) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Lock className="w-4 h-4" /></div>
                  <input
                    type={showPass[key] ? "text" : "password"}
                    value={pass[field]}
                    onChange={updatePass(field)}
                    placeholder={label}
                    className={inputCls(passErr[field])}
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
                {passErr[field] && <p className="mt-1 text-xs text-red-500">⚠ {passErr[field]}</p>}
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