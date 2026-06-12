"use server";

import { createAdminClient } from "@/utils/supabase/admin";

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
