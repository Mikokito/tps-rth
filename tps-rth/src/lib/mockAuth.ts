export interface User {
  id: string;
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  jabatan?: string;
  passwordHash: string;
  createdAt: string;
  role: "admin" | "user" | "petugas";
}

export type SessionUser = Omit<User, "passwordHash">;

const USERS_KEY = "tps_rth_users";
const SESSION_KEY = "tps_rth_session";

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export function saveUser(user: User): void {
  const users = getUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
}

export function findByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function emailExists(email: string): boolean {
  return !!findByEmail(email);
}

export function hashPassword(password: string): string {
  return btoa(encodeURIComponent(password));
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    return hashPassword(password) === hash;
  } catch {
    return false;
  }
}

export function setSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(): boolean {
  return getSession()?.role === "admin";
}

export function seedAdminUser(): void {
  if (typeof window === "undefined") return;
  if (!emailExists("admin@tpsrth.com")) {
    saveUser({
      id: "admin-001",
      nama: "Admin TPS RTH",
      rw: "01",
      rt: "01",
      email: "admin@tpsrth.com",
      hp: "081234567890",
      alamat: "TPS RTH Cikaret",
      passwordHash: hashPassword("admin123"),
      createdAt: new Date().toISOString(),
      role: "admin",
    });
  }
}

export function seedPetugasAccount(): void {
  if (typeof window === "undefined") return;
  const dummyPetugas: User = {
    id: "petugas-001",
    nama: "Ahmad Fauzi",
    rw: "02",
    rt: "03",
    email: "petugas@tpsrth.com",
    hp: "081299990001",
    alamat: "Jl. Dahlia No. 11, Cikaret",
    jabatan: "Petugas Lapangan",
    passwordHash: hashPassword("petugas123"),
    createdAt: "2023-06-01T00:00:00.000Z",
    role: "petugas",
  };
  const users = getUsers().filter((u) => u.email !== "petugas@tpsrth.com");
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, dummyPetugas]));
}

export function seedUserAccount(): void {
  if (typeof window === "undefined") return;
  const dummyUser: User = {
    id: "user-001",
    nama: "Budi Santoso",
    rw: "03",
    rt: "05",
    email: "user@tpsrth.com",
    hp: "08100000001",
    alamat: "Jl. Mawar No. 1, Cikaret",
    passwordHash: hashPassword("user123"),
    createdAt: "2023-01-15T00:00:00.000Z",
    role: "user",
  };
  const users = getUsers().filter((u) => u.email !== "user@tpsrth.com");
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, dummyUser]));
}