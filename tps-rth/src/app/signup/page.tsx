"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Leaf, Hash } from "lucide-react";
import FormInput from "@/components/FormInput";
import { emailExists, saveUser, hashPassword } from "@/lib/mockAuth";

interface FormState {
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  password: string;
}

type Errors = Partial<Record<keyof FormState | "general", string>>;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nama: "", rw: "", rt: "", email: "", hp: "", alamat: "", password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
    };
  }

  function validate(): Errors {
    const errs: Errors = {};
    if (!form.nama.trim() || form.nama.trim().length < 2)
      errs.nama = "Nama minimal 2 karakter";
    if (!form.rw.trim()) errs.rw = "RW wajib diisi";
    if (!form.rt.trim()) errs.rt = "RT wajib diisi";
    if (!form.email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Format email tidak valid";
    if (!form.hp.trim()) errs.hp = "Nomor HP wajib diisi";
    else if (form.hp.replace(/\D/g, "").length < 8) errs.hp = "Nomor HP tidak valid";
    if (!form.alamat.trim()) errs.alamat = "Alamat wajib diisi";
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
      if (emailExists(form.email.trim())) {
        setErrors({ email: "Email ini sudah terdaftar. Silakan gunakan email lain." });
        setLoading(false);
        return;
      }

      saveUser({
        id: Date.now().toString(),
        nama: form.nama.trim(),
        rw: form.rw.trim(),
        rt: form.rt.trim(),
        email: form.email.trim().toLowerCase(),
        hp: form.hp.trim(),
        alamat: form.alamat.trim(),
        passwordHash: hashPassword(form.password),
        createdAt: new Date().toISOString(),
      });

      sessionStorage.setItem("signup_success", "1");
      router.push("/login");
    }, 600);
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
                Bergabung dan jaga lingkungan.
              </h2>
              <p className="mt-3 text-sm text-gray-600 max-w-70">
                Daftar gratis sebagai nasabah TPS RTH dan mulai berkontribusi untuk lingkungan yang lebih bersih.
              </p>
              <div className="mt-10 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-mono text-gray-500 border-t border-gray-400/30 pt-3">
                <span>[ HERO / LIFESTYLE ]</span>
                <span>PLACEHOLDER · DROP IMAGE HERE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#FBFAF2] py-12 px-4">
          <div className="max-w-lg mx-auto">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Green header */}
              <div className="bg-[#2F855A] px-8 py-7 text-white text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold">Daftar Nasabah TPS RTH</h1>
                <p className="text-green-200 text-sm mt-1">Bergabung dan mulai menabung sampah</p>
              </div>

              {/* Form */}
              <div className="px-8 py-7">
                <p className="text-xs text-gray-500 mb-5">
                  Kolom bertanda <span className="text-red-500 font-semibold">*</span> wajib diisi.
                </p>

                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    ⚠ {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Nama */}
                  <FormInput
                    id="nama"
                    label="Nama Lengkap"
                    icon={<User className="w-4 h-4" />}
                    placeholder="Masukkan nama lengkap"
                    value={form.nama}
                    onChange={update("nama")}
                    error={errors.nama}
                    required
                    autoComplete="name"
                  />

                  {/* RW & RT */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      id="rw"
                      label="RW"
                      icon={<Hash className="w-4 h-4" />}
                      placeholder="Contoh: 05"
                      value={form.rw}
                      onChange={update("rw")}
                      error={errors.rw}
                      required
                    />
                    <FormInput
                      id="rt"
                      label="RT"
                      icon={<Hash className="w-4 h-4" />}
                      placeholder="Contoh: 02"
                      value={form.rt}
                      onChange={update("rt")}
                      error={errors.rt}
                      required
                    />
                  </div>

                  {/* Email */}
                  <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="email@contoh.com"
                    value={form.email}
                    onChange={update("email")}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />

                  {/* HP */}
                  <FormInput
                    id="hp"
                    label="Nomor HP / WhatsApp"
                    type="tel"
                    icon={<Phone className="w-4 h-4" />}
                    placeholder="08xx-xxxx-xxxx"
                    value={form.hp}
                    onChange={update("hp")}
                    error={errors.hp}
                    required
                    autoComplete="tel"
                  />

                  {/* Alamat */}
                  <FormInput
                    id="alamat"
                    label="Alamat Lengkap"
                    icon={<MapPin className="w-4 h-4" />}
                    placeholder="Jl. Nama Jalan No. X, Kelurahan..."
                    value={form.alamat}
                    onChange={update("alamat")}
                    error={errors.alamat}
                    required
                    autoComplete="street-address"
                  />

                  {/* Password */}
                  <FormInput
                    id="password"
                    label="Password"
                    type={showPass ? "text" : "password"}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={update("password")}
                    error={errors.password}
                    required
                    autoComplete="new-password"
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
                        Mendaftarkan...
                      </span>
                    ) : (
                      "Daftar Sekarang"
                    )}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-500">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-[#2F855A] font-semibold hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}