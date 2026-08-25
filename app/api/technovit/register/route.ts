import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { z } from 'zod';
import { upstreamPost } from '@/app/lib/technovit/upstream';
import { parseRegisterResult } from '@/app/lib/technovit/parse';
import { getUpstreamCookie, updateUpstreamCookie, getUserState } from '@/app/lib/technovit/session';
import { syncRegistrations } from '@/app/lib/technovit/registrationSync';

export const runtime = 'nodejs';

const RegisterSchema = z.object({
  upstreamEventId: z.string().trim().regex(/^[0-9]+$/).max(20),
});

export async function POST(request: NextRequest) {
  const cookie = await getUpstreamCookie();
  if (!cookie) {
    return NextResponse.json({ success: false, code: 'not_authenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, code: 'bad_request' }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, code: 'bad_request' }, { status: 400 });
  }

  let upstream;
  try {
    upstream = await upstreamPost('registerEvent', { id: parsed.data.upstreamEventId }, cookie);
  } catch {
    return NextResponse.json({ success: false, code: 'upstream_unreachable' }, { status: 502 });
  }

  const result = parseRegisterResult(upstream.html);
  const res = NextResponse.json(
    result.sessionExpired ? { success: false, code: 'session_expired' } : { success: true }
  );
  updateUpstreamCookie(res, upstream.setCookies, cookie);

  if (!result.sessionExpired) {
    const { username } = await getUserState();
    if (username) {
      after(() => syncRegistrations(cookie, username).catch(() => {}));
    }
  }

  return res;
}
