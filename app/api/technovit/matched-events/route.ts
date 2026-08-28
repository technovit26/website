import { NextResponse } from 'next/server';
import { matchEvents } from '@/app/lib/technovit/eventMatching';
import { getCachedUpstreamEvents } from '@/app/lib/technovit/eventCache';
import { fetchEvents } from '@/app/events/data';

export const runtime = 'nodejs';

export async function GET() {
  const upstreamEvents = await getCachedUpstreamEvents();
  if (!upstreamEvents) {
    return NextResponse.json({ ready: false, matchedIds: null });
  }

  const cmsEvents = await fetchEvents();
  const matched = matchEvents(cmsEvents, upstreamEvents);
  return NextResponse.json({ ready: true, matchedIds: Object.keys(matched) });
}
