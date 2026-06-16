"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { getPetugasPageData } from "@/app/actions/staff";

export type NasabahData = {
  id: string;
  rw: string | null;
  rt: string | null;
  alamat: string | null;
  hp: string | null;
  status_aktif: boolean;
  bergabung_tanggal: string | null;
};

export type IuranRow = {
  id: string;
  bulan: number;
  tahun: number;
  status: "belum" | "menunggu" | "diverifikasi" | "ditolak";
};

export async function getDashboardData(email: string): Promise<{
  nasabah: NasabahData | null;
  nasabahId: string | null;
  iuranList: IuranRow[];
  harga: number;
}> {
  const supabase = createAdminClient();

  // Get user UUID
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!userRow) {
    return { nasabah: null, nasabahId: null, iuranList: [], harga: 50000 };
  }

  // Get nasabah by user_id; fall back to email
  let { data: nasabahRow } = await supabase
    .from("nasabah")
    .select("id, rw, rt, alamat, hp, status_aktif, bergabung_tanggal")
    .eq("user_id", userRow.id)
    .maybeSingle();

  if (!nasabahRow) {
    const { data } = await supabase
      .from("nasabah")
      .select("id, rw, rt, alamat, hp, status_aktif, bergabung_tanggal")
      .eq("email", email)
      .maybeSingle();
    nasabahRow = data;
  }

  const [{ data: iuranData }, { data: hargaRow }] = await Promise.all([
    nasabahRow
      ? supabase
          .from("iuran")
          .select("id, bulan, tahun, status")
          .eq("nasabah_id", nasabahRow.id)
          .order("tahun",  { ascending: false })
          .order("bulan",  { ascending: false })
      : Promise.resolve({ data: [] as IuranRow[], error: null }),
    supabase
      .from("harga_iuran")
      .select("jumlah")
      .order("berlaku_mulai", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    nasabah:   nasabahRow   as NasabahData | null,
    nasabahId: nasabahRow?.id ?? null,
    iuranList: (iuranData   as IuranRow[]) ?? [],
    harga:     hargaRow?.jumlah ?? 50000,
  };
}

export type PetugasPerforma = {
  nama: string;
  jabatan: string;
  hadir: number;
  totalAbsen: number;
  persen: number;
};

export async function getAdminDashboardData(): Promise<{
  totalNasabah: number;
  nasabahAktif: number;
  totalPetugas: number;
  totalSampahKg: number;
  iuranPending: number;
  iuranSukses: number;
  petugasPerforma: PetugasPerforma[];
  error?: string;
}> {
  const supabase = createAdminClient();

  const [
    { data: nasabahData, error: nasabahError },
    { data: wasteData, error: wasteError },
    { data: iuranData, error: iuranError },
    { data: absenData, error: absenError },
    { staff: staffData, error: staffError },
  ] = await Promise.all([
    supabase.from("nasabah").select("id, status_aktif"),
    supabase.from("waste_entries").select("berat_kg"),
    supabase.from("iuran").select("id, status"),
    supabase.from("absensi").select("staff_id, status"),
    getPetugasPageData(),
  ]);

  const petugasRoster = staffData.filter((s) => s.role === "petugas");

  const petugasPerforma: PetugasPerforma[] = petugasRoster
    .map((p) => {
      const rows = (absenData ?? []).filter((a) => a.staff_id === p.staffRowId);
      const hadir = rows.filter((a) => a.status === "hadir").length;
      const totalAbsen = rows.length;
      return {
        nama: p.nama,
        jabatan: p.jabatan,
        hadir,
        totalAbsen,
        persen: totalAbsen > 0 ? Math.round((hadir / totalAbsen) * 100) : 0,
      };
    })
    .sort((a, b) => b.persen - a.persen || b.hadir - a.hadir);

  return {
    totalNasabah: (nasabahData ?? []).length,
    nasabahAktif: (nasabahData ?? []).filter((m) => m.status_aktif).length,
    totalPetugas: petugasRoster.length,
    totalSampahKg: (wasteData ?? []).reduce((t, w) => t + (w.berat_kg ?? 0), 0),
    iuranPending: (iuranData ?? []).filter((i) => i.status === "menunggu").length,
    iuranSukses: (iuranData ?? []).filter((i) => i.status === "diverifikasi").length,
    petugasPerforma,
    error: nasabahError?.message ?? wasteError?.message ?? iuranError?.message ?? absenError?.message ?? staffError,
  };
}

export async function submitIuran(payload: {
  nasabahId: string;
  userNama: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  fotoNama: string;
  fotoDataUrl: string;
  hargaIuran: number;
}): Promise<{ data: IuranRow | null; error: string | null }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("iuran")
    .insert({
      nasabah_id:    payload.nasabahId,
      user_nama:     payload.userNama,
      bulan:         payload.bulan,
      tahun:         payload.tahun,
      jumlah:        payload.jumlah,
      foto_nama:     payload.fotoNama,
      foto_data_url: payload.fotoDataUrl,
      status:        "menunggu",
      submitted_at:  new Date().toISOString(),
      harga_iuran:   payload.hargaIuran,
    })
    .select("id, bulan, tahun, status")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as IuranRow, error: null };
}
