import { getToken } from "./auth-storage";

// Prefer explicit env override; otherwise use same-origin `/api` proxy.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

type ApiError = Error & { status?: number };

function parseErrorPayload(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  if (payload && typeof payload === "object" && "fields" in payload) {
    const fields = (payload as { fields?: unknown }).fields;
    if (fields && typeof fields === "object") {
      const messages = Object.values(fields as Record<string, unknown>).filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      );
      if (messages.length > 0) return messages[0];
    }
  }
  return "Request failed";
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const hasJson = res.headers.get("content-type")?.includes("application/json");
  const payload = hasJson ? await res.json() : null;

  if (!res.ok) {
    // Return backend status/message so UI can decide what to do.
    const err = new Error(parseErrorPayload(payload)) as ApiError;
    err.status = res.status;
    throw err;
  }

  return payload as T;
}
