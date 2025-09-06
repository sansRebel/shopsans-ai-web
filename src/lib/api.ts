export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const ct = res.headers.get("content-type") ?? "";
    let details: unknown;
    try {
      details = ct.includes("application/json") ? await res.json() : await res.text();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, `API ${res.status}`, details);
  }

  return (await res.json()) as T;
}
