const FETCH_TIMEOUT_MS = 8_000;

function baseUrl(): string | null {
  return process.env.D1_WORKER_URL?.replace(/\/$/, '') ?? null;
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  const base = baseUrl();
  const secret = process.env.D1_WORKER_SECRET;
  if (!base || !secret) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...(init?.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${secret}`,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function d1Get<T>(path: string): Promise<T | null> {
  return call<T>(path, { method: 'GET' });
}

export async function d1Put(path: string, body: unknown): Promise<boolean> {
  const result = await call<{ success: boolean }>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return result?.success === true;
}
