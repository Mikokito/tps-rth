export interface User {
  id: string;
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  passwordHash: string;
  createdAt: string;
  role: "admin" | "user";
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