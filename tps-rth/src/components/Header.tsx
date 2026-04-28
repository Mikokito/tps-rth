"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Leaf, LogOut, UserCheck } from "lucide-react";
import { getSession, clearSession, type SessionUser } from "@/lib/mockAuth";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/berita", label: "Berita" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/kontak", label: "Kontak" },
  { href: "/cara-daftar", label: "Cara Daftar" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setSession(null);
    setIsOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#2F855A] rounded-full flex items-center justify-center group-hover:bg-[#276749] transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-lg text-[#2F855A] block leading-none">TPS RTH</span>
              <span className="text-[10px] text-gray-500 leading-none">Pengelolaan Sampah 3R</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#F0FFF4] text-[#2F855A]"
                      : "text-gray-600 hover:text-[#2F855A] hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-[#F0FFF4] rounded-lg px-3 py-2">
                  <UserCheck className="w-4 h-4 text-[#2F855A]" />
                  <span className="font-medium text-[#2F855A]">
                    {session.nama.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#2F855A] px-4 py-2 rounded-lg border border-[#2F855A] hover:bg-[#F0FFF4] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-white bg-[#2F855A] px-4 py-2 rounded-lg hover:bg-[#276749] transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#2F855A] hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-green-50 pb-3">
          <nav className="flex flex-col px-4 pt-2 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#F0FFF4] text-[#2F855A]"
                      : "text-gray-600 hover:text-[#2F855A] hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile auth */}
          <div className="px-4 pt-3 border-t border-gray-50 mt-2">
            {session ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#2F855A] font-medium">
                  <UserCheck className="w-4 h-4" />
                  Halo, {session.nama.split(" ")[0]}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center text-sm font-semibold text-[#2F855A] py-2 rounded-lg border border-[#2F855A] hover:bg-[#F0FFF4] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center text-sm font-semibold text-white bg-[#2F855A] py-2 rounded-lg hover:bg-[#276749] transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}