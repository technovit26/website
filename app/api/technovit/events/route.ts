import { NextResponse } from 'next/server';
import { matchEvents, normalizeEventName } from '@/app/lib/technovit/eventMatching';
import { getCachedUpstreamEvents } from '@/app/lib/technovit/eventCache';
import { getUpstreamCookie, getUserState } from '@/app/lib/technovit/session';
import { fetchEvents } from '@/app/events/data';
import { d1Get } from '@/app/lib/technovit/d1Client';

export const runtime = 'nodejs';

interface CachedRegistration {
  orderId: string;
  title: string;
  meta: string | null;
  amount: number | null;
  paid: boolean;
  payUrl: string | null;
}

export async function GET() {
  const cookie = await getUpstreamCookie();
  if (!cookie) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  const upstreamEvents = await getCachedUpstreamEvents();
  if (!upstreamEvents) {
    return NextResponse.json({ error: 'not_ready' }, { status: 503 });
  }

  const cmsEvents = await fetchEvents();
  const matched = matchEvents(cmsEvents, upstreamEvents);

  const registered: Record<string, { paid: boolean; amount: number | null; payUrl: string | null }> = {};
  const { username } = await getUserState();
  if (username) {
    const cached = await d1Get<{ events: CachedRegistration[] }>(
      `/registrations/${encodeURIComponent(username)}`
    );
    if (cached?.events?.length) {
      const byName = new Map(cached.events.map((e) => [normalizeEventName(e.title), e]));
      for (const cms of cmsEvents) {
        const hit = byName.get(normalizeEventName(cms.eventName));
        if (hit) {
          registered[cms.id] = { paid: hit.paid, amount: hit.amount, payUrl: hit.payUrl };
        }
      }
    }
  }

  return NextResponse.json({ matched, registered });
}
