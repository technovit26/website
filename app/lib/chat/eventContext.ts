import { formatEventWindow, formatPrice, type EventItem } from '../../events/data';
import { normalizeEventName } from '../technovit/eventMatching';

// The catalog is the model's entire knowledge of the fest: every event, one
// line each, with its short description. All 137 events come to ~13k tokens,
// which is what lets the model answer "find me two cybersec events" — there is
// no topic column in the data, so the subject only exists in this prose.
//
// Deliberately excluded: posterPath and registrationLink (identical for every
// event, pure token cost) and the faculty coordinator's phone and email, which
// is staff PII and must never reach a prompt students can talk to.
export function buildCatalog(events: EventItem[]): string {
  return events
    .map((e) =>
      [
        `#${e.id}`,
        e.eventName,
        e.clubName,
        e.eventType,
        formatEventWindow(e.startDateTime, e.endDateTime),
        e.eventVenue,
        formatPrice(e.pricePerPerson),
        e.teamSize > 1 ? `team of ${e.teamSize}` : 'solo',
        e.shortDescription,
      ].join(' | ')
    )
    .join('\n');
}

const MIN_NAME_LENGTH = 4;
const MAX_MENTIONS = 3;

/**
 * Events whose name appears in the user's message. Used to attach the full
 * long description only when someone asks about a specific event, instead of
 * shipping all 137 of them on every request.
 */
export function findMentionedEvents(message: string, events: EventItem[]): EventItem[] {
  let haystack = normalizeEventName(message);
  if (!haystack) return [];

  const candidates = events
    .map((event) => ({ event, key: normalizeEventName(event.eventName) }))
    .filter(({ key }) => key.length >= MIN_NAME_LENGTH)
    // Longest names first, so "OmegaHack" is consumed before plain "Hack".
    .sort((a, b) => b.key.length - a.key.length);

  const matched: EventItem[] = [];
  for (const { event, key } of candidates) {
    const at = haystack.indexOf(key);
    if (at === -1) continue;
    // Blank out what this name consumed; a shorter name nested inside it must
    // not match the same words. normalizeEventName strips everything but
    // letters and digits, so NUL can never appear in a key.
    haystack = `${haystack.slice(0, at)}\0${haystack.slice(at + key.length)}`;
    matched.push(event);
    if (matched.length >= MAX_MENTIONS) break;
  }
  return matched;
}

/** Full write-ups for the named events, appended below the catalog. */
export function buildEventDetails(events: EventItem[]): string {
  return events
    .filter((e) => e.longDescription && e.longDescription !== e.shortDescription)
    .map((e) => `${e.eventName} — full details:\n${e.longDescription}`)
    .join('\n\n');
}
