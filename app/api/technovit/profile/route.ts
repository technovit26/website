import { NextResponse } from 'next/server';
import { getUpstreamCookie, updateUpstreamCookie, getUserState } from '@/app/lib/technovit/session';
import { syncRegistrations } from '@/app/lib/technovit/registrationSync';

export const runtime = 'nodejs';

export async function GET() {
  const cookie = await getUpstreamCookie();
  const { username, loggedInAt } = await getUserState();
  if (!cookie || !username) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  let result;
  try {
    result = await syncRegistrations(cookie, username);
  } catch {
    return NextResponse.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  if (!result.ok) {
    console.log('[technovit profile debug] session_expired', {
      minutesSinceLogin: loggedInAt ? Math.round((Date.now() - loggedInAt) / 60000) : 'unknown (pre-upgrade cookie)',
    });
    return NextResponse.json({ error: 'session_expired' }, { status: 401 });
  }

  const res = NextResponse.json({ events: result.events, displayName: result.displayName });
  updateUpstreamCookie(res, result.setCookies, cookie);
  return res;
}
