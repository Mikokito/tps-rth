"use client";

import { useState, useEffect, useMemo } from "react";
import { Mail, MessageCircle, Trash2, Check, X, Inbox, MailOpen, AlertTriangle } from "lucide-react";
import { getAllPesan, markPesanDibaca, deletePesan, type PesanItem } from "@/app/actions/pesan";
import { SUBJEK_STYLE, buildWaLink, buildMailtoLink } from "@/lib/pesan";

type FilterStatus = "semua" | "belum" | "sudah";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PesanMasukPage() {
  const [items, setItems] = useState<PesanItem[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("semua");
  const [selected, setSelected] = useState<PesanItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await getAllPesan();
    setItems(data);
    setLoadError(error);
    setReady(true);
  }

  async function openPesan(item: PesanItem) {
    setSelected(item);
    if (!item.dibaca) {
      const { error } = await markPesanDibaca(item.id);
      if (!error) {
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, dibaca: true } : p)));
        setSelected((prev) => (prev && prev.id === item.id ? { ...prev, dibaca: true } : prev));
      }
    }
  }

  async function handleDelete(id: string) {
    const { error } = await deletePesan(id);
    if (!error) {
      setItems((prev) => prev.filter((p) => p.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
    }
    setDeleteConfirm(null);
  }

  const counts = useMemo(() => ({
    semua: items.length,
    belum: items.filter((p) => !p.dibaca).length,
    sudah: items.filter((p) => p.dibaca).length,
  }), [items]);

  const filtered = useMemo(() => {
    if (filter === "belum") return items.filter((p) => !p.dibaca);
    if (filter === "sudah") return items.filter((p) => p.dibaca);
    return items;
  }, [items, filter]);

  const FILTER_TABS: { key: FilterStatus; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "belum", label: "Belum Dibaca" },
    { key: "sudah", label: "Sudah Dibaca" },
  ];

  if (!ready) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pesan Masuk</h1>
        <p className="text-sm text-gray-500">Pesan dari formulir kontak di halaman depan</p>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Gagal memuat data: {loadError}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: counts.semua, color: "text-gray-700" },
          { label: "Belum Dibaca", value: counts.belum, color: "text-amber-600" },
          { label: "Sudah Dibaca", value: counts.sudah, color: "text-green-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white shadow-sm border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#2F855A]" />
            <h2 className="text-sm font-semibold text-gray-800">Daftar Pesan</h2>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === key ? "bg-[#2F855A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {label} <span className="opacity-70">({key === "semua" ? counts.semua : counts[key as "belum" | "sudah"]})</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
            <Inbox className="w-8 h-8 opacity-30" />
            <p className="text-sm">
              {filter === "semua" ? "Belum ada pesan." : "Tidak ada pesan untuk filter ini."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pengirim</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subjek</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pesan</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((row) => {
                    const waLink = buildWaLink(row.whatsapp);
                    return (
                      <tr
                        key={row.id}
                        onClick={() => openPesan(row)}
                        className={`cursor-pointer transition-colors ${row.dibaca ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-green-50/40"}`}
                      >
                        <td className="px-5 py-3.5">
                          <p className={row.dibaca ? "text-sm text-gray-600" : "text-sm font-semibold text-gray-900"}>{row.nama}</p>
                          <p className="text-xs text-gray-400">{row.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${SUBJEK_STYLE[row.subjek] ?? "bg-gray-100 text-gray-600"}`}>
                            {row.subjek}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 max-w-80 truncate">{row.pesan}</td>
                        <td className="px-4 py-3.5 text-center text-xs text-gray-500">{fmtDate(row.created_at)}</td>
                        <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <a href={buildMailtoLink(row.email, row.subjek)} className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors" title="Balas via Email">
                              <Mail className="w-4 h-4" />
                            </a>
                            {waLink && (
                              <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Balas via WhatsApp">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            {deleteConfirm === row.id ? (
                              <>
                                <button type="button" onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Konfirmasi hapus"><Check className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setDeleteConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Batal"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <button type="button" onClick={() => setDeleteConfirm(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map((row) => {
                const waLink = buildWaLink(row.whatsapp);
                return (
                  <div
                    key={row.id}
                    onClick={() => openPesan(row)}
                    className={`px-4 py-4 cursor-pointer ${row.dibaca ? "bg-gray-50" : "bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <p className={row.dibaca ? "text-sm text-gray-600" : "text-sm font-semibold text-gray-900"}>{row.nama}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${SUBJEK_STYLE[row.subjek] ?? "bg-gray-100 text-gray-600"}`}>
                        {row.subjek}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{row.pesan}</p>
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[11px] text-gray-300">{fmtDate(row.created_at)}</p>
                      <div className="flex items-center gap-1">
                        <a href={buildMailtoLink(row.email, row.subjek)} className="p-1.5 text-gray-400 hover:text-[#2F855A] hover:bg-green-50 rounded-lg transition-colors" title="Balas via Email">
                          <Mail className="w-4 h-4" />
                        </a>
                        {waLink && (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Balas via WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        {deleteConfirm === row.id ? (
                          <>
                            <button type="button" onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Konfirmasi hapus"><Check className="w-4 h-4" /></button>
                            <button type="button" onClick={() => setDeleteConfirm(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Batal"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setDeleteConfirm(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <MailOpen className="w-4 h-4 text-[#2F855A]" />
                <h2 className="font-semibold text-gray-900">Detail Pesan</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600" title="Tutup"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{selected.nama}</p>
                <p className="text-xs text-gray-400">{selected.email}</p>
                {selected.whatsapp && <p className="text-xs text-gray-400">WA: {selected.whatsapp}</p>}
              </div>
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${SUBJEK_STYLE[selected.subjek] ?? "bg-gray-100 text-gray-600"}`}>
                  {selected.subjek}
                </span>
                <span className="text-xs text-gray-400 ml-2">{fmtDate(selected.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {selected.pesan}
              </p>
              <div className="flex gap-3 pt-2">
                <a href={buildMailtoLink(selected.email, selected.subjek)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2F855A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#276749] transition-colors">
                  <Mail className="w-4 h-4" /> Balas via Email
                </a>
                {buildWaLink(selected.whatsapp) && (
                  <a href={buildWaLink(selected.whatsapp)!} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 border border-green-200 text-green-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-green-50 transition-colors">
                    <MessageCircle className="w-4 h-4" /> Balas via WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
