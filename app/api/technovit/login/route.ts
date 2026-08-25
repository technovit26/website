import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { upstreamPost } from '@/app/lib/technovit/upstream';
import { isLoginSuccessful, parseEventCards } from '@/app/lib/technovit/parse';
import { applyLoginSession } from '@/app/lib/technovit/session';
import { setCachedUpstreamEvents } from '@/app/lib/technovit/eventCache';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  kind: z.enum(['vitian', 'non-vitian']),
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, code: 'bad_request' }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, code: 'bad_request' }, { status: 400 });
  }
  const { kind, username, password } = parsed.data;

  let upstream;
  try {
    upstream = await upstreamPost(
      'mainDashboard',
      { validateVitian: kind === 'vitian' ? '1' : '2', username, password },
      null
    );
  } catch {
    return NextResponse.json({ success: false, code: 'upstream_unreachable' }, { status: 502 });
  }

  if (!isLoginSuccessful(upstream.html)) {
    return NextResponse.json({ success: false, code: 'invalid_credentials' }, { status: 401 });
  }

  await setCachedUpstreamEvents(parseEventCards(upstream.html));

  const res = NextResponse.json({ success: true, kind, username });
  applyLoginSession(res, { setCookies: upstream.setCookies, kind, username, password });
  return res;
}
