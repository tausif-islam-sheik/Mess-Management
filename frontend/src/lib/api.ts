/**
 * Minimal typed HTTP client for the NestJS Mess API.
 * Base URL comes from NEXT_PUBLIC_API_URL (defaults to the local backend).
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export const API_URL = `${API_BASE}/api`;

const TOKEN_KEY = "mess_access_token";
const USER_ID_KEY = "mess_current_user_id";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(id: string) {
  localStorage.setItem(USER_ID_KEY, id);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  /** Send the bearer token when one is stored (default true). */
  auth?: boolean;
  timeoutMs?: number;
}

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (opts.auth !== false) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      let message = res.statusText;
      try {
        const data = await res.json();
        const m = (data as { message?: string | string[] })?.message;
        if (Array.isArray(m)) message = m.join(", ");
        else if (typeof m === "string") message = m;
      } catch {
        /* keep default message */
      }
      throw new ApiError(res.status, message);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Quick check used at boot to decide between API mode and local demo mode. */
export async function isApiReachable(timeoutMs = 4000): Promise<boolean> {
  try {
    await apiFetch<{ ok: boolean }>("/health", { auth: false, timeoutMs });
    return true;
  } catch {
    return false;
  }
}
