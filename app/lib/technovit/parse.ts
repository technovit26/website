import * as cheerio from 'cheerio';

export function isLoginSuccessful(html: string): boolean {
  const $ = cheerio.load(html);
  const hasEventButtons = $('button[name="eid"]').length > 0;
  const hasLoginForm = $('#confLoginBox').length > 0 || $('input[name="password"]').length > 0;
  return hasEventButtons && !hasLoginForm;
}

export function isSessionExpired(html: string): boolean {
  const $ = cheerio.load(html);
  return $('input[name="password"]').length > 0 && $('button[name="eid"]').length === 0;
}

export function isProfileSessionExpired(html: string): boolean {
  const $ = cheerio.load(html);
  const hasProfileContent = $('input[name="name"]').length > 0;
  const hasLoginForm = $('#confLoginBox').length > 0 || $('input[name="password"]').length > 0;
  return hasLoginForm && !hasProfileContent;
}

export interface UpstreamEventCard {
  upstreamEventId: string;
  name: string;
}

export function parseEventCards(html: string): UpstreamEventCard[] {
  const $ = cheerio.load(html);
  const cards: UpstreamEventCard[] = [];
  $('button[name="eid"]').each((_, el) => {
    const $el = $(el);
    const upstreamEventId = $el.attr('value');
    if (!upstreamEventId) return;
    const header = $el.closest('.card').find('.card-header').first();
    const span = header.find('span').first();
    const name = (span.length ? span.text() : header.text()).trim();
    if (!name) return;
    cards.push({ upstreamEventId, name });
  });
  return cards;
}

export function parseRegisterResult(html: string): { success: boolean; sessionExpired: boolean } {
  const sessionExpired = isSessionExpired(html);
  return { success: !sessionExpired, sessionExpired };
}

export function parseTeamResult(html: string): { success: boolean; sessionExpired: boolean; message?: string } {
  const sessionExpired = isSessionExpired(html);
  if (sessionExpired) return { success: false, sessionExpired: true };
  const $ = cheerio.load(html);
  const errorText = $('.alert-danger, .text-danger, .help-block').first().text().trim();
  if (errorText) return { success: false, sessionExpired: false, message: errorText.slice(0, 200) };
  return { success: true, sessionExpired: false };
}

export interface RegisteredEvent {
  orderId: string | null;
  title: string;
  meta: string;
  paid: boolean;
  payUrl: string | null;
}

function resolvePayUrl(href: string | undefined): string | null {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  try {
    return new URL(href, 'https://chennaievents.vit.ac.in/technovit/profile').toString();
  } catch {
    return null;
  }
}

export function parseRegisteredEvents(html: string): RegisteredEvent[] {
  const $ = cheerio.load(html);
  const card = $('.card')
    .filter((_, el) => /EVENTS REGISTERED/i.test($(el).find('.card-header').first().text()))
    .first();
  if (!card.length) return [];

  const results: RegisteredEvent[] = [];
  card.find('table tr').each((_, row) => {
    const $row = $(row);
    const cells = $row
      .find('td, th')
      .map((_, cell) => $(cell).text().replace(/\s+/g, ' ').trim())
      .get();
    if (cells.length === 0) return;

    const rowText = cells.join(' ');
    const orderMatch = rowText.match(/ORDER ID\s*:?\s*(\d+)/i);
    const title = (cells[0] ?? '').replace(/ORDER ID\s*:?\s*\d+/i, '').trim() || rowText;
    const meta = cells.slice(1, 4).filter(Boolean).join(' · ');

    const notYetPaid = /not\s*yet\s*paid/i.test(rowText);
    const paid = !notYetPaid && /\bpaid\b/i.test(rowText);

    const payLink = $row.find('a, button').filter((_, el) => /pay/i.test($(el).text())).first();
    const payUrl = resolvePayUrl(payLink.attr('href'));

    results.push({
      orderId: orderMatch ? orderMatch[1] : null,
      title,
      meta,
      paid,
      payUrl,
    });
  });

  return results;
}

export function parseDisplayName(html: string): string | null {
  const $ = cheerio.load(html);
  const value = $('input[name="name"]').first().attr('value');
  return value && value.trim() ? value.trim() : null;
}
