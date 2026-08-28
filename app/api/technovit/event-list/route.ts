import { NextResponse } from 'next/server';
import { fetchEvents } from '@/app/events/data';

export async function GET() {
  const events = await fetchEvents();
  return NextResponse.json(events);
}
