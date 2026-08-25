import type { EventItem } from '@/app/events/data';
import type { UpstreamEventCard } from './parse';

export function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchEvents(cmsEvents: EventItem[], upstreamEvents: UpstreamEventCard[]): Record<string, string> {
  const byName = new Map<string, string[]>();
  for (const ev of upstreamEvents) {
    const key = normalizeEventName(ev.name);
    const list = byName.get(key) ?? [];
    list.push(ev.upstreamEventId);
    byName.set(key, list);
  }

  const matched: Record<string, string> = {};
  for (const cms of cmsEvents) {
    const candidates = byName.get(normalizeEventName(cms.eventName));
    if (candidates && candidates.length === 1) {
      matched[cms.id] = candidates[0];
    }
  }
  return matched;
}
