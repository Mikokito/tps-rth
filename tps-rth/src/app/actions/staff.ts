"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export type StaffRole = "admin" | "manajer" | "petugas";

export type StaffMember = {
  id: string;
  staffRowId: string | null;
  nama: string;
  jabatan: string;
  rw: string | null;
  rt: string | null;
  hp: string | null;
  role: StaffRole;
  user_id: string | null;
  nasabah_id: string | null;
  gaji_pokok: number;
};

export type NasabahOption = {
  id: string;
  user_id: string | null;
  nama: string;
  rw: string;
  rt: string;
  hp: string;
};

type RawStaffRow = {
  id: string;
  nama: string;
  jabatan: string;
  role: StaffRole;
  rw: string | null;
  rt: string | null;
  hp: string | null;
  user_id: string | null;
  nasabah_id: string | null;
  gaji_pokok: number | null;
};

type RawUserRow = {
  id: string;
  nama: string;
  rw: string | null;
  rt: string | null;
  hp: string | null;
  role: StaffRole;
};

const STAFF_SELECT = "id, nama, jabatan, role, rw, rt, hp, user_id, nasabah_id, gaji_pokok";
const PENGURUS_ROLES: StaffRole[] = ["admin", "manajer", "petugas"];

export async function setStaffAuthRole(
  userId: string,
  role: StaffRole | "user",
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError || !existing.user) return { error: fetchError?.message ?? "Akun pengguna tidak ditemukan" };

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { ...existing.user.user_metadata, role },
  });
  if (error) return { error: error.message };

  await supabase.from("users").update({ role }).eq("id", userId);
  return {};
}

export async function getPetugasPageData(): Promise<{
  staff: StaffMember[];
  nasabah: NasabahOption[];
  error?: string;
}> {
  const supabase = createAdminClient();
  const [
    { data: staffRows, error: staffError },
    { data: userRows, error: userError },
    { data: nasabahRows, error: nasabahError },
  ] = await Promise.all([
    supabase.from("staff_members").select(STAFF_SELECT).order("nama"),
    supabase.from("users").select("id, nama, rw, rt, hp, role").in("role", PENGURUS_ROLES),
    supabase.from("nasabah").select("id, user_id, nama, rw, rt, hp").order("nama"),
  ]);

  const usersById = new Map(((userRows as RawUserRow[]) ?? []).map((u) => [u.id, u]));
  const claimedUserIds = new Set<string>();
  const claimedNames = new Set<string>();

  const fromStaff: StaffMember[] = ((staffRows as RawStaffRow[]) ?? []).map((s) => {
    const matchedUser = s.user_id ? usersById.get(s.user_id) : undefined;
    if (s.user_id) claimedUserIds.add(s.user_id);
    else claimedNames.add(s.nama.trim().toLowerCase());

    return {
      id: s.user_id ?? s.id,
      staffRowId: s.id,
      nama: s.nama,
      jabatan: s.jabatan,
      rw: s.rw ?? matchedUser?.rw ?? null,
      rt: s.rt ?? matchedUser?.rt ?? null,
      hp: s.hp ?? matchedUser?.hp ?? null,
      role: matchedUser?.role ?? s.role,
      user_id: s.user_id,
      nasabah_id: s.nasabah_id,
      gaji_pokok: s.gaji_pokok ?? 0,
    };
  });

  const fromUsers: StaffMember[] = ((userRows as RawUserRow[]) ?? [])
    .filter((u) => !claimedUserIds.has(u.id) && !claimedNames.has(u.nama.trim().toLowerCase()))
    .map((u) => ({
      id: u.id,
      staffRowId: null,
      nama: u.nama,
      jabatan: "",
      rw: u.rw || null,
      rt: u.rt || null,
      hp: u.hp || null,
      role: u.role,
      user_id: u.id,
      nasabah_id: null,
      gaji_pokok: 0,
    }));

  const staff = [...fromStaff, ...fromUsers].sort((a, b) => a.nama.localeCompare(b.nama));

  return {
    staff,
    nasabah: (nasabahRows as NasabahOption[]) ?? [],
    error: staffError?.message ?? userError?.message ?? nasabahError?.message,
  };
}

export async function createStaffFromNasabah(input: {
  nasabahId: string;
  nama: string;
  rw: string;
  rt: string;
  hp: string;
  userId: string | null;
  jabatan: string;
  role: StaffRole;
}): Promise<{ data?: StaffMember; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff_members")
    .insert({
      nama: input.nama,
      rw: input.rw,
      rt: input.rt,
      hp: input.hp,
      jabatan: input.jabatan,
      role: input.role,
      nasabah_id: input.nasabahId,
      user_id: input.userId,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (input.userId) await setStaffAuthRole(input.userId, input.role);

  return {
    data: {
      id: input.userId ?? data.id,
      staffRowId: data.id,
      nama: input.nama,
      jabatan: input.jabatan,
      rw: input.rw,
      rt: input.rt,
      hp: input.hp,
      role: input.role,
      user_id: input.userId,
      nasabah_id: input.nasabahId,
      gaji_pokok: 0,
    },
  };
}

export async function updateStaffJabatanRole(input: {
  staffRowId: string | null;
  userId: string | null;
  nama: string;
  rw: string | null;
  rt: string | null;
  hp: string | null;
  jabatan: string;
  role: StaffRole;
}): Promise<{ data?: StaffMember; error?: string }> {
  const supabase = createAdminClient();

  let staffRowId: string = input.staffRowId ?? "";
  let nasabahId: string | null = null;
  let gajiPokok = 0;

  if (staffRowId) {
    const { data, error } = await supabase
      .from("staff_members")
      .update({ jabatan: input.jabatan, role: input.role })
      .eq("id", staffRowId)
      .select("id, nasabah_id, gaji_pokok")
      .single();
    if (error) return { error: error.message };
    nasabahId = data.nasabah_id;
    gajiPokok = data.gaji_pokok ?? 0;
  } else {
    const { data, error } = await supabase
      .from("staff_members")
      .insert({
        nama: input.nama,
        rw: input.rw,
        rt: input.rt,
        hp: input.hp,
        jabatan: input.jabatan,
        role: input.role,
        user_id: input.userId,
      })
      .select("id, nasabah_id, gaji_pokok")
      .single();
    if (error) return { error: error.message };
    staffRowId = data.id;
    nasabahId = data.nasabah_id;
    gajiPokok = data.gaji_pokok ?? 0;
  }

  if (input.userId) await setStaffAuthRole(input.userId, input.role);

  return {
    data: {
      id: input.userId ?? staffRowId,
      staffRowId,
      nama: input.nama,
      jabatan: input.jabatan,
      rw: input.rw,
      rt: input.rt,
      hp: input.hp,
      role: input.role,
      user_id: input.userId,
      nasabah_id: nasabahId,
      gaji_pokok: gajiPokok,
    },
  };
}

export async function deleteStaffMember(input: {
  staffRowId: string | null;
  userId: string | null;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  if (input.staffRowId) {
    const { error } = await supabase.from("staff_members").delete().eq("id", input.staffRowId);
    if (error) return { error: error.message };
  }

  if (input.userId) await setStaffAuthRole(input.userId, "user");
  return {};
}
