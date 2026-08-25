import { NextResponse } from 'next/server';
import { clearSession } from '@/app/lib/technovit/session';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearSession(res);
  return res;
}
