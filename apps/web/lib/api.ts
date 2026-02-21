// apps/web/lib/api.ts
export function apiBase(): string {
  // 브라우저에서만 쓰는 값
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return "http://localhost:3001";
  return base;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}
