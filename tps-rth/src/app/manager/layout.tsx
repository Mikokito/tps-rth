"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Leaf, CalendarDays, CalendarCheck, CalendarRange,
  Newspaper, Menu, X, LogOut, ChevronRight, LayoutDashboard, Home,
} from "lucide-react";
import { getSession, clearSession, type SessionUser } from "@/lib/mockAuth";

const navItems = [
  { href: "/manager/dashboard",  label: "Dashboard",           icon: LayoutDashboard },
  { href: "/manager/jadwal",     label: "Jadwal Kerja",        icon: CalendarDays },
  { href: "/manager/absen",      label: "Absen Petugas",       icon: CalendarCheck },
  { href: "/manager/izin",       label: "Izin & Cuti",         icon: CalendarRange },
  { href: "/manager/berita",     label: "Berita",              icon: Newspaper },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession2] = useState<SessionUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then((s) => {
      if (!s || (s.role !== "manager" && s.role !== "manajer")) {
        router.replace("/login");
        return;
      }
      setSession2(s);
      setReady(true);
    });
  }, [router]);

  async function handleLogout() {
    await clearSession();
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Memeriksa akses...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-[#1a3c2e] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/10">
          <div className="w-8 h-8 bg-[#2F855A] rounded-full flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-sm block">TPS RTH Manager</span>
            <span className="text-[10px] text-green-300/70">Panel Manajer</span>
          </div>
          <button
            type="button"
            title="Tutup menu"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  active
                    ? "bg-[#2F855A] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 space-y-1">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            Kembali ke Beranda
          </Link>

          <div className="border-t border-white/10 pt-2">
            <Link
              href="/manager/akun"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-[#2F855A] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                {session?.avatar_url
                  ? <img src={session.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span>{session?.nama?.[0] ?? "M"}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate group-hover:text-white">{session?.nama}</p>
                <p className="text-[10px] text-white/50 truncate">{session?.email}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
                className="text-white/40 hover:text-red-400 transition-colors shrink-0"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button
            type="button"
            title="Buka menu"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 text-sm font-semibold text-gray-700">
            {navItems.find((n) => n.href === pathname)?.label ?? "Manager Panel"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2F855A] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {session?.avatar_url
                ? <img src={session.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span>{session?.nama?.[0] ?? "M"}</span>}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
              {session?.nama}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
