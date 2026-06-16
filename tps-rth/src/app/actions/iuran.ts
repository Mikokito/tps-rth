"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type IuranStatus = "menunggu" | "diverifikasi" | "ditolak";

export type IuranRecord = {
  id: string;
  nasabah_id: string;
  user_nama: string;
  nasabah_email: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  status: IuranStatus;
  submitted_at: string;
  verified_at: string | null;
  foto_nama: string | null;
  foto_data_url: string | null;
  harga_iuran: number | null;
};

const IURAN_SELECT = "id, nasabah_id, user_nama, bulan, tahun, jumlah, status, submitted_at, verified_at, foto_nama, foto_data_url, harga_iuran";

async function resolveNasabahId(supabase: SupabaseClient, userId: string, email: string): Promise<string | null> {
  const { data: byUserId } = await supabase.from("nasabah").select("id").eq("user_id", userId).maybeSingle();
  if (byUserId) return byUserId.id;
  const { data: byEmail } = await supabase.from("nasabah").select("id").eq("email", email).maybeSingle();
  return byEmail?.id ?? null;
}

async function attachEmails(supabase: SupabaseClient, rows: Omit<IuranRecord, "nasabah_email">[]): Promise<IuranRecord[]> {
  const nasabahIds = [...new Set(rows.map((r) => r.nasabah_id))];
  const { data: nasabahRows } = nasabahIds.length
    ? await supabase.from("nasabah").select("id, email").in("id", nasabahIds)
    : { data: [] };
  const emailById = new Map((nasabahRows ?? []).map((n) => [n.id, n.email as string]));
  return rows.map((r) => ({ ...r, nasabah_email: emailById.get(r.nasabah_id) ?? "" }));
}

export async function getHargaIuran(): Promise<{ jumlah: number; berlakuMulai: string }> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("harga_iuran")
    .select("jumlah, berlaku_mulai")
    .order("berlaku_mulai", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { jumlah: data?.jumlah ?? 50000, berlakuMulai: data?.berlaku_mulai ?? new Date().toISOString().slice(0, 10) };
}

export async function setHargaIuran(jumlah: number): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const berlaku_mulai = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("harga_iuran").insert({ jumlah, berlaku_mulai });
  return { error: error?.message };
}

export async function getMyIuran(userId: string, email: string): Promise<{ data: IuranRecord[]; error?: string }> {
  const supabase = createAdminClient();
  const nasabahId = await resolveNasabahId(supabase, userId, email);
  if (!nasabahId) return { data: [] };

  const { data, error } = await supabase
    .from("iuran")
    .select(IURAN_SELECT)
    .eq("nasabah_id", nasabahId)
    .order("submitted_at", { ascending: false });
  if (error) return { data: [], error: error.message };

  return { data: (data ?? []).map((r) => ({ ...r, nasabah_email: email })) as IuranRecord[] };
}

export async function submitIuran(input: {
  userId: string;
  email: string;
  userNama: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  fotoNama: string;
  fotoDataUrl: string;
}): Promise<{ data?: IuranRecord; error?: string }> {
  const supabase = createAdminClient();
  const nasabahId = await resolveNasabahId(supabase, input.userId, input.email);
  if (!nasabahId) return { error: "Data nasabah tidak ditemukan" };

  const { data: dup } = await supabase
    .from("iuran")
    .select("id")
    .eq("nasabah_id", nasabahId)
    .eq("bulan", input.bulan)
    .eq("tahun", input.tahun)
    .maybeSingle();
  if (dup) return { error: "Iuran bulan ini sudah pernah diajukan" };

  const { data, error } = await supabase
    .from("iuran")
    .insert({
      nasabah_id: nasabahId,
      user_nama: input.userNama,
      bulan: input.bulan,
      tahun: input.tahun,
      jumlah: input.jumlah,
      status: "menunggu",
      submitted_at: new Date().toISOString(),
      foto_nama: input.fotoNama,
      foto_data_url: input.fotoDataUrl,
      harga_iuran: input.jumlah,
    })
    .select(IURAN_SELECT)
    .single();
  if (error) return { error: error.message };

  return { data: { ...data, nasabah_email: input.email } as IuranRecord };
}

export async function getAllIuran(): Promise<{ data: IuranRecord[]; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("iuran")
    .select(IURAN_SELECT)
    .order("submitted_at", { ascending: false });
  if (error) return { data: [], error: error.message };

  return { data: await attachEmails(supabase, (data ?? []) as Omit<IuranRecord, "nasabah_email">[]) };
}

export async function updateIuranStatus(id: string, status: IuranStatus): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const verified_at = status === "diverifikasi" ? new Date().toISOString() : null;
  const { error } = await supabase.from("iuran").update({ status, verified_at }).eq("id", id);
  return { error: error?.message };
}
