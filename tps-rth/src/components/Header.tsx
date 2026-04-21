"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Leaf } from "lucide-react";

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
  const pathname = usePathname();

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
        </div>
      )}
    </header>
  );
}
