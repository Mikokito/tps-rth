"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Leaf, CheckCircle } from "lucide-react";
import FormInput from "@/components/FormInput";
import { signIn } from "@/lib/mockAuth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem("signup_success");
    if (flag) {
      setJustRegistered(true);
      sessionStorage.removeItem("signup_success");
    }
  }, []);

  function validate() {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Format email tidak valid";
    if (!form.password) errs.password = "Password wajib diisi";
    else if (form.password.length < 6) errs.password = "Password minimal 6 karakter";
    return errs;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});

    const { user, error } = await signIn(form.email.trim(), form.password);
    if (error || !user) {
      setErrors({ general: "Email atau password salah. Silakan coba lagi." });
      setLoading(false);
      return;
    }
    router.push(
      user.role === "admin"                                  ? "/admin/dashboard"   :
      (user.role === "manager" || user.role === "manajer")   ? "/manager/dashboard" :
      user.role === "petugas"                                ? "/petugas/dashboard" :
      "/user/dashboard",
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Full-page background */}
      <img
        src="/webp/RTH.jpg"
        alt="TPST-3R RTH PBPA"
        className="absolute inset-0 object-cover w-full h-full"
      />
      {/* Dark overlay 70% */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Centered content */}
      <div className="relative z-10 w-full max-w-md">
        {justRegistered && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-[#F0FFF4] border border-green-200 rounded-xl text-sm text-[#2F855A] font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Pendaftaran berhasil! Silakan masuk dengan akun Anda.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#2F855A] px-8 py-7 text-white text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Masuk ke TPST-3R RTH PBPA</h1>
            <p className="text-green-200 text-sm mt-1">Selamat datang kembali!</p>
          </div>

          <div className="px-8 py-7">
            {errors.general && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                ⚠ {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormInput
                id="email"
                label="Email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                error={errors.email}
                required
                autoComplete="email"
              />

              <FormInput
                id="password"
                label="Password"
                type={showPass ? "text" : "password"}
                icon={<Lock className="w-4 h-4" />}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                required
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2F855A] text-white font-semibold py-3 rounded-xl hover:bg-[#276749] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link href="/signup" className="text-[#2F855A] font-semibold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}