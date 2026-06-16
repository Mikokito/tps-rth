"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export type NasabahMember = {
  id: string;
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string | null;
  status_aktif: boolean;
  bergabung_tanggal: string;
};

const NASABAH_SELECT = "id, nama, rw, rt, email, hp, alamat, status_aktif, bergabung_tanggal";

export async function getNasabahList(): Promise<{ data: NasabahMember[]; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("nasabah").select(NASABAH_SELECT).order("nama");
  return { data: (data as NasabahMember[]) ?? [], error: error?.message };
}

export async function createNasabah(input: {
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  status_aktif: boolean;
  bergabung_tanggal: string;
}): Promise<{ data?: NasabahMember; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("nasabah")
    .insert(input)
    .select(NASABAH_SELECT)
    .single();
  if (error) return { error: error.message };
  return { data: data as NasabahMember };
}

export async function updateNasabah(
  id: string,
  input: {
    nama: string;
    rw: string;
    rt: string;
    email: string;
    hp: string;
    alamat: string;
    status_aktif: boolean;
    bergabung_tanggal: string;
  },
): Promise<{ data?: NasabahMember; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("nasabah")
    .update(input)
    .eq("id", id)
    .select(NASABAH_SELECT)
    .single();
  if (error) return { error: error.message };
  return { data: data as NasabahMember };
}

export async function deleteNasabah(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("nasabah").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
