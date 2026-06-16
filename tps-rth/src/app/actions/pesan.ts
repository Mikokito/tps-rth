"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export type PesanItem = {
  id: string;
  nama: string;
  email: string;
  whatsapp: string | null;
  subjek: string;
  pesan: string;
  dibaca: boolean;
  created_at: string;
};

const PESAN_SELECT = "id, nama, email, whatsapp, subjek, pesan, dibaca, created_at";

export async function getAllPesan(): Promise<{ data: PesanItem[]; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pesan")
    .select(PESAN_SELECT)
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data as PesanItem[]) ?? [] };
}

export async function markPesanDibaca(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("pesan").update({ dibaca: true }).eq("id", id);
  return { error: error?.message };
}

export async function deletePesan(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("pesan").delete().eq("id", id);
  return { error: error?.message };
}
