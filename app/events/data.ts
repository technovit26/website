const WORKER_BASE = 'https://techno.worker.puang.in';
const EVENTS_ENDPOINT = `${WORKER_BASE}/events`;
const REVALIDATE_SECONDS = 900;

// R2 bucket's own custom domain — serves assets straight from R2 via
// Cloudflare's edge, bypassing the Worker (and its invocation cost) entirely.
const ASSETS_CDN_BASE = 'https://cdn.puang.in';

interface RawEvent {
  id: number | string;
  event_name: string;
  club_name: string;
  event_type: string;
  event_for: string;
  poster_path: string;
  start_date_time: string;
  end_date_time: string;
  price_per_person: number;
  participation_type: string;
  event_venue: string;
  short_description: string;
  long_description: string;
  is_special_event: number | boolean;
  registration_link: string;
  team_size: string | number;
  faculty_coord_emp_id: string;
  faculty_coord_name: string;
  faculty_coord_mobile: string;
  faculty_coord_email: string;
}

export interface EventItem {
  id: string;
  eventName: string;
  clubName: string;
  eventType: string;
  eventFor: string;
  posterPath: string;
  startDateTime: string;
  endDateTime: string;
  pricePerPerson: number;
  participationType: string;
  eventVenue: string;
  shortDescription: string;
  longDescription: string;
  isSpecialEvent: boolean;
  registrationLink: string;
  teamSize: number;
  facultyCoordEmpId: string;
  facultyCoordName: string;
  facultyCoordMobile: string;
  facultyCoordEmail: string;
}

function toIso(dateTime: string): string {
  return dateTime.includes('T') ? dateTime : dateTime.replace(' ', 'T');
}

function normalizeEventType(value: string): string {
  // Upstream sends 'Workshop', 'workshop' and 'Competition ' as distinct
  // values; fold case too or they show up as separate filters and as separate
  // categories to the chatbot.
  return (value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\p{Ll}/gu, (match) => match.toUpperCase());
}

function normalizeEventFor(value: string): string {
  const v = (value || '').replace(/\s+/g, ' ').trim();
  return /^both$/i.test(v) ? 'VITian/Non-VITian' : v;
}

function normalizeEvent(raw: RawEvent): EventItem {
  const teamSize = Math.max(1, Math.round(parseFloat(String(raw.team_size))) || 1);
  return {
    id: String(raw.id),
    eventName: raw.event_name,
    clubName: raw.club_name,
    eventType: normalizeEventType(raw.event_type),
    eventFor: normalizeEventFor(raw.event_for),
    posterPath: raw.poster_path,
    startDateTime: toIso(raw.start_date_time),
    endDateTime: toIso(raw.end_date_time),
    pricePerPerson: raw.price_per_person,
    participationType: raw.participation_type,
    eventVenue: raw.event_venue.replace(/\r\n|\r|\n/g, ', ').trim(),
    shortDescription: raw.short_description || 'Details coming soon.',
    longDescription: raw.long_description || raw.short_description || 'Full details coming soon.',
    isSpecialEvent: Boolean(raw.is_special_event),
    registrationLink: raw.registration_link,
    teamSize,
    facultyCoordEmpId: raw.faculty_coord_emp_id,
    facultyCoordName: raw.faculty_coord_name,
    facultyCoordMobile: raw.faculty_coord_mobile,
    facultyCoordEmail: raw.faculty_coord_email,
  };
}

export async function fetchEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch(EVENTS_ENDPOINT, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const raw: RawEvent[] = await res.json();
    return raw.map(normalizeEvent);
  } catch {
    return [];
  }
}

export function posterUrl(posterPath: string): string {
  return `${ASSETS_CDN_BASE}/${posterPath}`;
}

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatEventWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${formatEventDate(startIso)} · ${formatEventTime(startIso)} – ${formatEventTime(endIso)}`;
  }
  return `${formatEventDate(startIso)} ${formatEventTime(startIso)} – ${formatEventDate(endIso)} ${formatEventTime(endIso)}`;
}

export function formatPrice(price: number): string {
  return price === 0 ? 'Free' : `₹${price}`;
}
