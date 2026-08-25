const TECHNOVIT_BASE = 'https://chennaievents.vit.ac.in/technovit';
const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; technoVIT-website/1.0)';
const MAX_REDIRECTS = 5;

export type UpstreamPostPath =
  | 'mainDashboard'
  | 'getEventByClubId'
  | 'eventPreview'
  | 'registerEvent'
  | 'createTeam';

export type UpstreamGetPath = 'mainDashboard' | 'profile';

export interface UpstreamResult {
  html: string;
  setCookies: string[];
  status: number;
  hops: number;
}

function mergeCookieHeader(existing: string | null, setCookies: string[]): string | null {
  const map = new Map<string, string>();
  if (existing) {
    for (const part of existing.split(';')) {
      const idx = part.indexOf('=');
      if (idx === -1) continue;
      map.set(part.slice(0, idx).trim(), part.slice(idx + 1).trim());
    }
  }
  for (const raw of setCookies) {
    const pair = raw.split(';')[0] ?? '';
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    map.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
  }
  if (map.size === 0) return existing ?? null;
  return [...map.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function singleFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, redirect: 'manual', cache: 'no-store', signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function request(
  path: UpstreamPostPath | UpstreamGetPath,
  init: RequestInit,
  cookie: string | null
): Promise<UpstreamResult> {
  let url = `${TECHNOVIT_BASE}/${path}`;
  let currentInit: RequestInit = init;
  let currentCookie = cookie;
  const allSetCookies: string[] = [];

  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    const res = await singleFetch(url, {
      ...currentInit,
      headers: {
        ...(currentInit.headers as Record<string, string> | undefined),
        'User-Agent': USER_AGENT,
        Referer: `${TECHNOVIT_BASE}/`,
        ...(currentCookie ? { Cookie: currentCookie } : {}),
      },
    });

    const setCookies = res.headers.getSetCookie?.() ?? [];
    if (setCookies.length) {
      allSetCookies.push(...setCookies);
      currentCookie = mergeCookieHeader(currentCookie, setCookies);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        const html = await res.text();
        return { html, setCookies: allSetCookies, status: res.status, hops: hop };
      }
      url = new URL(location, url).toString();
      currentInit = { method: 'GET' };
      continue;
    }

    const html = await res.text();
    return { html, setCookies: allSetCookies, status: res.status, hops: hop };
  }

  throw new Error('too many redirects');
}

export async function upstreamPost(
  path: UpstreamPostPath,
  body: Record<string, string | string[]>,
  cookie: string | null
): Promise<UpstreamResult> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.append(key, value);
  }
  return request(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    },
    cookie
  );
}

export async function upstreamGet(path: UpstreamGetPath, cookie: string | null): Promise<UpstreamResult> {
  return request(path, { method: 'GET' }, cookie);
}
