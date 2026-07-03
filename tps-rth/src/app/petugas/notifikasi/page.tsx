"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { getSession } from "@/lib/mockAuth";
import { getPetugasNotifikasi, type NotifItem } from "@/app/actions/notifikasi";

const TYPE_STYLE: Record<NotifItem["type"], string> = {
  success: "bg-green-50 text-green-600",
  error:   "bg-red-50 text-red-500",
  warning: "bg-amber-50 text-amber-600",
  info:    "bg-blue-50 text-blue-600",
};

const TYPE_ICON: Record<NotifItem["type"], React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  error:   <XCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  info:    <Info className="w-4 h-4" />,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PetugasNotifikasiPage() {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (!session) { setReady(true); return; }
      const { data } = await getPetugasNotifikasi(session.id, session.nama);
      setItems(data);
      setReady(true);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
        <p className="text-sm text-gray-500">Update pengajuan izin/cuti dan gaji Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {!ready ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <Bell className="w-8 h-8 text-gray-200" />
            <p className="text-sm">Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((n) => (
              <Link key={n.id} href={n.href} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_STYLE[n.type]}`}>
                  {TYPE_ICON[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1">{fmtDate(n.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
