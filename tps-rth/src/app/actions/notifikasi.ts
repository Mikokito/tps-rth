"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export type NotifItem = {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  date: string;
  href: string;
};

const BULAN_LABEL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function sortByDateDesc(items: NotifItem[]): NotifItem[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getNasabahNotifikasi(userId: string, email: string): Promise<{ data: NotifItem[]; error?: string }> {
  const supabase = createAdminClient();

  let nasabahId: string | null = null;
  const { data: byUserId } = await supabase.from("nasabah").select("id").eq("user_id", userId).maybeSingle();
  nasabahId = byUserId?.id ?? null;
  if (!nasabahId) {
    const { data: byEmail } = await supabase.from("nasabah").select("id").eq("email", email).maybeSingle();
    nasabahId = byEmail?.id ?? null;
  }
  if (!nasabahId) return { data: [] };

  const { data, error } = await supabase
    .from("iuran")
    .select("id, bulan, tahun, status, verified_at, submitted_at")
    .eq("nasabah_id", nasabahId)
    .neq("status", "menunggu")
    .order("submitted_at", { ascending: false });
  if (error) return { data: [], error: error.message };

  const items: NotifItem[] = (data ?? []).map((r) => ({
    id: r.id,
    title: r.status === "diverifikasi" ? "Iuran Diverifikasi" : "Iuran Ditolak",
    message: `Pengajuan iuran ${BULAN_LABEL[r.bulan - 1]} ${r.tahun} telah ${r.status === "diverifikasi" ? "diverifikasi" : "ditolak"}.`,
    type: r.status === "diverifikasi" ? "success" : "error",
    date: r.verified_at ?? r.submitted_at,
    href: "/user/iuran",
  }));

  return { data: sortByDateDesc(items) };
}

export async function getPetugasNotifikasi(userId: string, nama: string): Promise<{ data: NotifItem[]; error?: string }> {
  const supabase = createAdminClient();

  let staffId: string | null = null;
  const { data: byUserId } = await supabase.from("staff_members").select("id").eq("user_id", userId).maybeSingle();
  staffId = byUserId?.id ?? null;
  if (!staffId) {
    const { data: byNama } = await supabase.from("staff_members").select("id").eq("nama", nama).maybeSingle();
    staffId = byNama?.id ?? null;
  }
  if (!staffId) return { data: [] };

  const [{ data: izinRows, error: izinError }, { data: gajiRows, error: gajiError }] = await Promise.all([
    supabase
      .from("izin_cuti")
      .select("id, jenis, status, tanggal_mulai, confirmed_at, submitted_at, catatan")
      .eq("staff_id", staffId)
      .neq("status", "menunggu")
      .order("confirmed_at", { ascending: false }),
    supabase
      .from("gaji_staff")
      .select("id, bulan, tahun, created_at")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false }),
  ]);
  if (izinError || gajiError) return { data: [], error: izinError?.message ?? gajiError?.message };

  const items: NotifItem[] = [
    ...(izinRows ?? []).map((r) => ({
      id: `izin-${r.id}`,
      title: r.status === "disetujui" ? "Pengajuan Disetujui" : "Pengajuan Ditolak",
      message: `Pengajuan ${r.jenis === "cuti" ? "cuti" : "izin"} Anda telah ${r.status === "disetujui" ? "disetujui" : "ditolak"}.${r.catatan ? ` Catatan: ${r.catatan}` : ""}`,
      type: (r.status === "disetujui" ? "success" : "error") as NotifItem["type"],
      date: r.confirmed_at ?? r.submitted_at,
      href: "/petugas/izin",
    })),
    ...(gajiRows ?? []).map((r) => ({
      id: `gaji-${r.id}`,
      title: "Gaji Tercatat",
      message: `Gaji bulan ${BULAN_LABEL[r.bulan - 1]} ${r.tahun} telah dicatat oleh admin.`,
      type: "info" as NotifItem["type"],
      date: r.created_at,
      href: "/petugas/akun",
    })),
  ];

  return { data: sortByDateDesc(items) };
}

export async function getManajerNotifikasi(): Promise<{ data: NotifItem[]; error?: string }> {
  const supabase = createAdminClient();
  const { data: izinRows, error } = await supabase
    .from("izin_cuti")
    .select("id, jenis, staff_id, submitted_at")
    .eq("status", "menunggu")
    .order("submitted_at", { ascending: false });
  if (error) return { data: [], error: error.message };

  const staffIds = [...new Set((izinRows ?? []).map((r) => r.staff_id))];
  const { data: staffRows } = staffIds.length
    ? await supabase.from("staff_members").select("id, nama").in("id", staffIds)
    : { data: [] };
  const namaById = new Map((staffRows ?? []).map((s) => [s.id, s.nama]));

  const items: NotifItem[] = (izinRows ?? []).map((r) => ({
    id: r.id,
    title: "Pengajuan Baru",
    message: `${namaById.get(r.staff_id) ?? "Petugas"} mengajukan ${r.jenis === "cuti" ? "cuti" : "izin"} dan menunggu konfirmasi.`,
    type: "warning",
    date: r.submitted_at,
    href: "/manager/izin",
  }));

  return { data: sortByDateDesc(items) };
}

export async function getAdminNotifikasi(): Promise<{ data: NotifItem[]; error?: string }> {
  const supabase = createAdminClient();
  const [{ data: iuranRows, error: iuranError }, { data: izinRows, error: izinError }] = await Promise.all([
    supabase
      .from("iuran")
      .select("id, user_nama, bulan, tahun, submitted_at")
      .eq("status", "menunggu")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("izin_cuti")
      .select("id, jenis, staff_id, submitted_at")
      .eq("status", "menunggu")
      .order("submitted_at", { ascending: false }),
  ]);
  if (iuranError || izinError) return { data: [], error: iuranError?.message ?? izinError?.message };

  const staffIds = [...new Set((izinRows ?? []).map((r) => r.staff_id))];
  const { data: staffRows } = staffIds.length
    ? await supabase.from("staff_members").select("id, nama").in("id", staffIds)
    : { data: [] };
  const namaById = new Map((staffRows ?? []).map((s) => [s.id, s.nama]));

  const items: NotifItem[] = [
    ...(iuranRows ?? []).map((r) => ({
      id: `iuran-${r.id}`,
      title: "Iuran Menunggu Verifikasi",
      message: `${r.user_nama} mengirim bukti iuran ${BULAN_LABEL[r.bulan - 1]} ${r.tahun}.`,
      type: "warning" as NotifItem["type"],
      date: r.submitted_at,
      href: "/admin/iuran",
    })),
    ...(izinRows ?? []).map((r) => ({
      id: `izin-${r.id}`,
      title: "Pengajuan Izin/Cuti Baru",
      message: `${namaById.get(r.staff_id) ?? "Petugas"} mengajukan ${r.jenis === "cuti" ? "cuti" : "izin"} dan menunggu konfirmasi.`,
      type: "warning" as NotifItem["type"],
      date: r.submitted_at,
      href: "/admin/izin-cuti",
    })),
  ];

  return { data: sortByDateDesc(items) };
}
