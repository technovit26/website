import type { UpstreamEventCard } from './parse';
import { d1Get, d1Put } from './d1Client';

let cachedEvents: UpstreamEventCard[] | null = null;

export async function setCachedUpstreamEvents(events: UpstreamEventCard[]): Promise<void> {
  if (events.length === 0) return;
  cachedEvents = events;
  await d1Put('/upstream-events', { events });
}

export async function getCachedUpstreamEvents(): Promise<UpstreamEventCard[] | null> {
  if (cachedEvents) return cachedEvents;
  const remote = await d1Get<{ events: UpstreamEventCard[] }>('/upstream-events');
  if (remote?.events && remote.events.length > 0) {
    cachedEvents = remote.events;
    return cachedEvents;
  }
  return null;
}
