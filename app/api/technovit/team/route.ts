import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { upstreamPost } from '@/app/lib/technovit/upstream';
import { parseTeamResult } from '@/app/lib/technovit/parse';
import { getUpstreamCookie, updateUpstreamCookie } from '@/app/lib/technovit/session';

export const runtime = 'nodejs';

const TeamSchema = z.object({
  teamName: z.string().trim().min(1).max(60),
  memberUsernames: z.array(z.string().trim().min(1).max(50)).min(1).max(20),
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

  const parsed = TeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, code: 'bad_request' }, { status: 400 });
  }
  const { teamName, memberUsernames } = parsed.data;

  let upstream;
  try {
    upstream = await upstreamPost(
      'createTeam',
      {
        'teamModel.teamname': teamName,
        'teamModel.teamsize': String(memberUsernames.length),
        idParticipants: memberUsernames,
      },
      cookie
    );
  } catch {
    return NextResponse.json({ success: false, code: 'upstream_unreachable' }, { status: 502 });
  }

  const result = parseTeamResult(upstream.html);
  const res = NextResponse.json(
    result.sessionExpired
      ? { success: false, code: 'session_expired' }
      : result.success
        ? { success: true }
        : { success: false, code: 'upstream_rejected', message: result.message }
  );
  updateUpstreamCookie(res, upstream.setCookies, cookie);
  return res;
}
