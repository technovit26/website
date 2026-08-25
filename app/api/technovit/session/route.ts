import { NextResponse } from 'next/server';
import { getUserState } from '@/app/lib/technovit/session';

export const runtime = 'nodejs';

export async function GET() {
  const state = await getUserState();
  return NextResponse.json(state);
}
