import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SID_COOKIE = 'technovit_sid';
const USER_COOKIE = 'technovit_user';
const CRED_COOKIE = 'technovit_cred';
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
  loggedInAt?: number;
}

export interface StoredCredentials {
  kind: 'vitian' | 'non-vitian';
  username: string;
  password: string;
}

function credKey(): Buffer | null {
  const raw = process.env.TECHNOVIT_CRED_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, 'base64');
  return key.length === 32 ? key : null;
}

function encryptPassword(password: string): string | null {
  const key = credKey();
  if (!key) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((b) => b.toString('base64')).join('.');
}

function decryptPassword(blob: string): string | null {
  const key = credKey();
  if (!key) return null;
  const parts = blob.split('.');
  if (parts.length !== 3) return null;
  try {
    const [iv, authTag, ciphertext] = parts.map((p) => Buffer.from(p, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
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
    const parsed = JSON.parse(raw) as { kind: 'vitian' | 'non-vitian'; username: string; loggedInAt?: number };
    return { loggedIn: true, kind: parsed.kind, username: parsed.username, loggedInAt: parsed.loggedInAt };
  } catch {
    return { loggedIn: false };
  }
}

export async function getStoredCredentials(): Promise<StoredCredentials | null> {
  const jar = await cookies();
  const credRaw = jar.get(CRED_COOKIE)?.value;
  const userRaw = jar.get(USER_COOKIE)?.value;
  if (!credRaw || !userRaw) return null;
  try {
    const { kind, username } = JSON.parse(userRaw) as { kind: 'vitian' | 'non-vitian'; username: string };
    const password = decryptPassword(credRaw);
    if (!password) return null;
    return { kind, username, password };
  } catch {
    return null;
  }
}

export function applyLoginSession(
  res: NextResponse,
  opts: { setCookies: string[]; kind: 'vitian' | 'non-vitian'; username: string; password: string }
) {
  const combined = combineCookiePairs(opts.setCookies);
  if (combined) res.cookies.set(SID_COOKIE, combined, cookieOptions);
  res.cookies.set(
    USER_COOKIE,
    JSON.stringify({ kind: opts.kind, username: opts.username, loggedInAt: Date.now() }),
    cookieOptions
  );
  const encrypted = encryptPassword(opts.password);
  if (encrypted) res.cookies.set(CRED_COOKIE, encrypted, cookieOptions);
}

export function updateUpstreamCookie(res: NextResponse, setCookies: string[], existing?: string | null) {
  const combined = combineCookiePairs(setCookies, existing);
  if (combined) res.cookies.set(SID_COOKIE, combined, cookieOptions);
}

export function clearSession(res: NextResponse) {
  res.cookies.delete(SID_COOKIE);
  res.cookies.delete(USER_COOKIE);
  res.cookies.delete(CRED_COOKIE);
}
