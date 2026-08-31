import type { EventItem } from '@/app/events/data';
import type { UpstreamEventCard } from './parse';

export function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export function matchEvents(cmsEvents: EventItem[], upstreamEvents: UpstreamEventCard[]): Record<string, string> {
  const byName = new Map<string, string[]>();
  for (const ev of upstreamEvents) {
    const key = normalizeEventName(ev.name);
    const list = byName.get(key) ?? [];
    list.push(ev.upstreamEventId);
    byName.set(key, list);
  }

  const cmsByName = new Map<string, EventItem[]>();
  for (const cms of cmsEvents) {
    const key = normalizeEventName(cms.eventName);
    const list = cmsByName.get(key) ?? [];
    list.push(cms);
    cmsByName.set(key, list);
  }

  const matched: Record<string, string> = {};
  for (const cms of cmsEvents) {
    const key = normalizeEventName(cms.eventName);
    const candidates = byName.get(key);
    if (!candidates) continue;

    if (candidates.length === 1) {
      matched[cms.id] = candidates[0];
      continue;
    }

    // Multiple upstream events share this name (e.g. the same workshop run
    // on separate dates). Disambiguate by pairing CMS events (sorted by
    // start time) with upstream candidates in listed order — only when the
    // counts line up, so an unrelated collision never gets a wrong match.
    const cmsGroup = cmsByName.get(key)!;
    if (cmsGroup.length === candidates.length) {
      const sortedCmsGroup = [...cmsGroup].sort(
        (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );
      const index = sortedCmsGroup.findIndex((c) => c.id === cms.id);
      if (index !== -1) matched[cms.id] = candidates[index];
    }
  }
  return matched;
}
