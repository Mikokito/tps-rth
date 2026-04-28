"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Leaf, CheckCircle } from "lucide-react";
import FormInput from "@/components/FormInput";
import { findByEmail, verifyPassword, setSession } from "@/lib/mockAuth";

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

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});

    setTimeout(() => {
      const user = findByEmail(form.email);
      if (!user || !verifyPassword(form.password, user.passwordHash)) {
        setErrors({ general: "Email atau password salah. Silakan coba lagi." });
        setLoading(false);
        return;
      }
      const { passwordHash: _, ...sessionData } = user;
      setSession(sessionData);
      router.push("/");
    }, 500);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFAF2]">
      <div className="grid lg:grid-cols-2 flex-1">
        <div className="relative hidden lg:flex flex-col overflow-hidden">
          <img
            src="/webp/danau.webp"
            alt="Danau"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(230, 218, 196, 0.87)",
            }}
          />
          <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2F855A] inline-block" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-gray-700">
                TPS RTH · ISSUE NO. 04
              </span>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-mono text-gray-500 mb-5">
                [ HERO / LIFESTYLE ]
              </p>
              <h2 className="font-serif text-4xl xl:text-5xl font-bold leading-snug text-gray-900">
                Kelola sampah, raih manfaat nyata.
              </h2>
              <p className="mt-3 text-sm text-gray-600 max-w-[280px]">
                Masuk untuk mengakses dashboard Anda dan pantau setoran sampah secara real-time.
              </p>
              <div className="mt-10 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-mono text-gray-500 border-t border-gray-400/30 pt-3">
                <span>[ HERO / LIFESTYLE ]</span>
                <span>PLACEHOLDER · DROP IMAGE HERE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#FBFAF2] py-12 px-4">
          <div className="w-full max-w-md">
            {/* Registered banner */}
            {justRegistered && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-[#F0FFF4] border border-green-200 rounded-xl text-sm text-[#2F855A] font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Pendaftaran berhasil! Silakan masuk dengan akun Anda.
              </div>
            )}

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Green header */}
              <div className="bg-[#2F855A] px-8 py-7 text-white text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold">Masuk ke TPS RTH</h1>
                <p className="text-green-200 text-sm mt-1">Kelola sampah, dapatkan manfaat</p>
              </div>

              {/* Form */}
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
                <p className="mt-2 text-center text-xs text-gray-400">
                  Atau{" "}
                  <Link href="/cara-daftar" className="hover:underline">
                    pelajari cara mendaftar
                  </Link>{" "}
                  sebagai nasabah TPS RTH
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}