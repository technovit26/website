import { upstreamGet, upstreamPost } from './upstream';
import {
  parseRegisteredEvents,
  parseDisplayName,
  isProfileSessionExpired,
  isLoginSuccessful,
  type RegisteredEvent,
} from './parse';
import { normalizeEventName } from './eventMatching';
import { fetchEvents } from '@/app/events/data';
import { d1Put } from './d1Client';
import { getStoredCredentials } from './session';

export interface SyncedRegistration extends RegisteredEvent {
  amount: number | null;
  endsAt: string | null;
}

export interface SyncResult {
  ok: boolean;
  sessionExpired?: boolean;
  events: SyncedRegistration[];
  displayName: string | null;
  setCookies: string[];
}

const RETRY_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reloginAndFetchProfile() {
  const creds = await getStoredCredentials();
  if (!creds) return null;

  const login = await upstreamPost(
    'mainDashboard',
    { validateVitian: creds.kind === 'vitian' ? '1' : '2', username: creds.username, password: creds.password },
    null
  );
  if (!isLoginSuccessful(login.html)) return null;

  const freshCookie = login.setCookies
    .map((raw) => raw.split(';')[0]?.trim())
    .filter((pair): pair is string => Boolean(pair))
    .join('; ');
  if (!freshCookie) return null;

  const profile = await upstreamGet('profile', freshCookie);
  return { ...profile, setCookies: [...login.setCookies, ...profile.setCookies] };
}

export async function syncRegistrations(cookie: string, username: string): Promise<SyncResult> {
  let upstream = await upstreamGet('profile', cookie);

  if (isProfileSessionExpired(upstream.html)) {
    await sleep(RETRY_DELAY_MS);
    upstream = await upstreamGet('profile', cookie);
  }

  if (isProfileSessionExpired(upstream.html)) {
    const relogin = await reloginAndFetchProfile();
    if (relogin) {
      upstream = relogin;
    }
  }

  if (isProfileSessionExpired(upstream.html)) {
    return { ok: false, sessionExpired: true, events: [], displayName: null, setCookies: upstream.setCookies };
  }

  const registeredEvents = parseRegisteredEvents(upstream.html);
  const displayName = parseDisplayName(upstream.html);

  const cmsEvents = await fetchEvents();
  const cmsByName = new Map(cmsEvents.map((e) => [normalizeEventName(e.eventName), e]));
  const events: SyncedRegistration[] = registeredEvents.map((event) => {
    const cms = cmsByName.get(normalizeEventName(event.title));
    return {
      ...event,
      amount: cms?.pricePerPerson ?? null,
      endsAt: cms?.endDateTime ?? null,
    };
  });

  await d1Put(`/registrations/${encodeURIComponent(username)}`, { events, displayName });

  return { ok: true, events, displayName, setCookies: upstream.setCookies };
}
