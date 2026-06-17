"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { uploadBuktiToStorage } from "@/lib/storage";

export type GajiEntry = {
  id: string;
  staff_id: string;
  bulan: number;
  tahun: number;
  status: "sudah" | "belum";
  jumlah: number | null;
  gaji_pokok: number;
  foto_nama: string | null;
  foto_data_url: string | null;
  created_at: string;
};

const GAJI_SELECT = "id, staff_id, bulan, tahun, status, jumlah, gaji_pokok, foto_nama, foto_data_url, created_at";

export async function getGajiHistory(staffId: string): Promise<{ data: GajiEntry[]; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gaji_staff")
    .select(GAJI_SELECT)
    .eq("staff_id", staffId)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });
  return { data: (data as GajiEntry[]) ?? [], error: error?.message };
}

export async function uploadGajiBukti(input: {
  staffId: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  gajiPokok: number;
  fotoNama: string;
  fotoDataUrl: string;
}): Promise<{ data?: GajiEntry; error?: string }> {
  const storagePath = `gaji/${input.staffId}/${input.tahun}-${String(input.bulan).padStart(2, "0")}-${Date.now()}`;
  let fotoUrl: string;
  try {
    fotoUrl = await uploadBuktiToStorage(storagePath, input.fotoDataUrl);
  } catch (err) {
    return { error: (err as Error).message };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gaji_staff")
    .upsert(
      {
        staff_id: input.staffId,
        bulan: input.bulan,
        tahun: input.tahun,
        status: "sudah",
        jumlah: input.jumlah,
        gaji_pokok: input.gajiPokok,
        foto_nama: input.fotoNama,
        foto_data_url: fotoUrl,
      },
      { onConflict: "staff_id,bulan,tahun" },
    )
    .select(GAJI_SELECT)
    .single();
  if (error) return { error: error.message };
  return { data: data as GajiEntry };
}
