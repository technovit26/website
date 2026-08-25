import { upstreamGet } from './upstream';
import { parseRegisteredEvents, parseDisplayName, isProfileSessionExpired, type RegisteredEvent } from './parse';
import { normalizeEventName } from './eventMatching';
import { fetchEvents } from '@/app/events/data';
import { d1Put } from './d1Client';

export interface SyncedRegistration extends RegisteredEvent {
  amount: number | null;
}

export interface SyncResult {
  ok: boolean;
  sessionExpired?: boolean;
  events: SyncedRegistration[];
  displayName: string | null;
  setCookies: string[];
}

export async function syncRegistrations(cookie: string, username: string): Promise<SyncResult> {
  const upstream = await upstreamGet('profile', cookie);

  if (isProfileSessionExpired(upstream.html)) {
    return { ok: false, sessionExpired: true, events: [], displayName: null, setCookies: upstream.setCookies };
  }

  const registeredEvents = parseRegisteredEvents(upstream.html);
  const displayName = parseDisplayName(upstream.html);

  const cmsEvents = await fetchEvents();
  const priceByName = new Map(cmsEvents.map((e) => [normalizeEventName(e.eventName), e.pricePerPerson]));
  const events: SyncedRegistration[] = registeredEvents.map((event) => ({
    ...event,
    amount: priceByName.get(normalizeEventName(event.title)) ?? null,
  }));

  await d1Put(`/registrations/${encodeURIComponent(username)}`, { events, displayName });

  return { ok: true, events, displayName, setCookies: upstream.setCookies };
}
