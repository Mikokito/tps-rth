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
  avatar_url?: string;
  createdAt: string;
  role: "admin" | "manager" | "manajer" | "petugas" | "user";
}

// ─── Avatar localStorage helpers ─────────────────────────────────────────────
// Avatar is stored in localStorage (not auth metadata) to keep session
// cookies small and avoid HTTP 431 "Request Header Fields Too Large".

function avatarKey(userId: string) {
  return `tps_avatar_${userId}`;
}

function readLocalAvatar(userId: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(avatarKey(userId)) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeLocalAvatar(userId: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) localStorage.setItem(avatarKey(userId), value);
    else localStorage.removeItem(avatarKey(userId));
  } catch {
    // QuotaExceededError — silently ignore
  }
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

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
    // avatar_url is intentionally NOT read from auth metadata here;
    // it is merged from localStorage in getSession() to keep cookies small.
    createdAt: meta.createdAt ?? user.created_at ?? "",
    role: meta.role ?? "user",
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const session = toSessionUser(user);
  // Merge avatar from localStorage (source of truth)
  const localAvatar = readLocalAvatar(session.id);
  if (localAvatar) session.avatar_url = localAvatar;
  return session;
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

  const user = toSessionUser(data.user);

  // Migrate any old large base64 avatar from auth metadata → localStorage,
  // then clear it from auth metadata so the session cookie stays small.
  const rawAvatar = data.user.user_metadata?.avatar_url as string | undefined;
  if (rawAvatar && rawAvatar.startsWith("data:")) {
    writeLocalAvatar(user.id, rawAvatar);
    user.avatar_url = rawAvatar;
    await supabase.auth.updateUser({ data: { avatar_url: null } });
  } else {
    user.avatar_url = readLocalAvatar(user.id);
  }

  return { user };
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
  const { data: authData, error } = await supabase.auth.signUp({
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

  // Auto-create public.users and nasabah rows so the dashboard can find this user
  const uid = authData.user?.id;
  if (uid) {
    await supabase.from("users").upsert({
      id: uid,
      nama: data.nama,
      email: data.email,
      rw: data.rw,
      rt: data.rt,
      hp: data.hp,
      alamat: data.alamat,
      role: "user",
      password_hash: "",
    }, { onConflict: "id" });

    await supabase.from("nasabah").insert({
      user_id: uid,
      nama: data.nama,
      email: data.email,
      rw: data.rw,
      rt: data.rt,
      hp: data.hp,
      alamat: data.alamat,
      status_aktif: true,
      bergabung_tanggal: new Date().toISOString().split("T")[0],
    });
  }

  return {};
}

export async function updateProfile(data: {
  nama?: string;
  hp?: string;
  alamat?: string;
  jabatan?: string;
  rw?: string;
  rt?: string;
  avatar_url?: string;
}): Promise<{ user?: SessionUser; error?: string }> {
  const supabase = createClient();

  // Strip avatar_url from auth metadata update — always force it null to
  // clear any old large base64 that may still be in the user record.
  const { avatar_url, ...metaData } = data;
  const { data: result, error } = await supabase.auth.updateUser({
    data: { ...metaData, avatar_url: null },
  });
  if (error || !result.user) return { error: error?.message ?? "Update gagal" };

  const user = toSessionUser(result.user);

  // Persist avatar to localStorage and reflect in returned user
  if (avatar_url !== undefined) {
    writeLocalAvatar(user.id, avatar_url || null);
    user.avatar_url = avatar_url || undefined;
  } else {
    user.avatar_url = readLocalAvatar(user.id);
  }

  return { user };
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
