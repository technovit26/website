import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SID_COOKIE = 'technovit_sid';
const USER_COOKIE = 'technovit_user';
const MAX_AGE = 60 * 60 * 6;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE,
};

export interface UserState {
  loggedIn: boolean;
  kind?: 'vitian' | 'non-vitian';
  username?: string;
}

function parseCookiePairs(cookieHeader: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) map.set(name, value);
  }
  return map;
}

function combineCookiePairs(setCookies: string[], existing?: string | null): string | null {
  const map = existing ? parseCookiePairs(existing) : new Map<string, string>();
  for (const raw of setCookies) {
    const pair = raw.split(';')[0]?.trim();
    if (!pair) continue;
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (name) map.set(name, value);
  }
  if (map.size === 0) return null;
  return [...map.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

export async function getUpstreamCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SID_COOKIE)?.value ?? null;
}

export async function getUserState(): Promise<UserState> {
  const jar = await cookies();
  if (!jar.has(SID_COOKIE)) return { loggedIn: false };
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return { loggedIn: false };
  try {
    const parsed = JSON.parse(raw) as { kind: 'vitian' | 'non-vitian'; username: string };
    return { loggedIn: true, kind: parsed.kind, username: parsed.username };
  } catch {
    return { loggedIn: false };
  }
}

export function applyLoginSession(
  res: NextResponse,
  opts: { setCookies: string[]; kind: 'vitian' | 'non-vitian'; username: string }
) {
  const combined = combineCookiePairs(opts.setCookies);
  if (combined) res.cookies.set(SID_COOKIE, combined, cookieOptions);
  res.cookies.set(USER_COOKIE, JSON.stringify({ kind: opts.kind, username: opts.username }), cookieOptions);
}

export function updateUpstreamCookie(res: NextResponse, setCookies: string[], existing?: string | null) {
  const combined = combineCookiePairs(setCookies, existing);
  if (combined) res.cookies.set(SID_COOKIE, combined, cookieOptions);
}

export function clearSession(res: NextResponse) {
  res.cookies.delete(SID_COOKIE);
  res.cookies.delete(USER_COOKIE);
}
