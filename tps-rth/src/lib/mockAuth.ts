import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export interface SessionUser {
  id: string;
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  jabatan?: string;
  createdAt: string;
  role: "admin" | "manager" | "petugas" | "user";
}

function toSessionUser(user: User): SessionUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    nama: meta.nama ?? "",
    rw: meta.rw ?? "",
    rt: meta.rt ?? "",
    hp: meta.hp ?? "",
    alamat: meta.alamat ?? "",
    jabatan: meta.jabatan,
    createdAt: meta.createdAt ?? user.created_at ?? "",
    role: meta.role ?? "user",
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return toSessionUser(user);
}

export async function clearSession(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: SessionUser | null; error?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { user: null, error: error?.message };
  return { user: toSessionUser(data.user) };
}

export async function signUp(data: {
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  password: string;
}): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        nama: data.nama,
        rw: data.rw,
        rt: data.rt,
        hp: data.hp,
        alamat: data.alamat,
        role: "user",
        createdAt: new Date().toISOString(),
      },
    },
  });
  if (error) return { error: error.message };
  return {};
}

export async function updateProfile(data: {
  nama?: string;
  hp?: string;
  alamat?: string;
  jabatan?: string;
  rw?: string;
  rt?: string;
}): Promise<{ user?: SessionUser; error?: string }> {
  const supabase = createClient();
  const { data: result, error } = await supabase.auth.updateUser({ data });
  if (error || !result.user) return { error: error?.message ?? "Update gagal" };
  return { user: toSessionUser(result.user) };
}

export async function updatePassword(
  email: string,
  oldPassword: string,
  newPassword: string,
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: oldPassword });
  if (signInError) return { error: "Password lama tidak sesuai" };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}

// Kept as no-ops so existing callers don't break
export function seedAdminUser() {}
export function seedPetugasAccount() {}
export function seedUserAccount() {}
export function seedManagerAccount() {}
export function isAdmin(): boolean { return false; }
