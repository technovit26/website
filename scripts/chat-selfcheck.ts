// Self-check for the chatbot's two pieces of real logic: key rotation and
// event name matching. Run with:  node scripts/chat-selfcheck.ts
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

import type { EventItem } from '../app/events/data';

// The app is written for a bundler, so its relative imports have no file
// extension and Node's ESM resolver cannot follow them. Teach it to try '.ts'.
// Imports below are dynamic so this hook is registered before they resolve.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return { url: candidate.href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
});

const { keyCount, markExhausted, nextKey, resetPoolForTests } = await import(
  '../app/lib/chat/keyPool.ts'
);
const { buildCatalog, buildEventDetails, findMentionedEvents } = await import(
  '../app/lib/chat/eventContext.ts'
);

function event(partial: Partial<EventItem> & { id: string; eventName: string }): EventItem {
  return {
    clubName: 'CSI',
    eventType: 'Hackathon',
    eventFor: 'Both',
    posterPath: 'x.webp',
    startDateTime: '2026-08-28T08:00:00',
    endDateTime: '2026-08-28T13:00:00',
    pricePerPerson: 100,
    participationType: 'Solo',
    eventVenue: 'Nethaji Auditorium',
    shortDescription: 'A short blurb.',
    longDescription: 'A much longer write-up with rules and details.',
    isSpecialEvent: false,
    registrationLink: 'https://example.test',
    teamSize: 1,
    facultyCoordEmpId: '52264',
    facultyCoordName: 'R Krithiga',
    facultyCoordMobile: '9677123933',
    facultyCoordEmail: 'faculty@vit.ac.in',
    ...partial,
  };
}

// --- key pool -------------------------------------------------------------

for (const name of Object.keys(process.env)) {
  if (name.startsWith('GEMINI_API_KEY')) delete process.env[name];
}
process.env.GEMINI_API_KEYS = 'alpha, bravo\ncharlie';
process.env.GEMINI_API_KEY_2 = 'delta';
process.env.GEMINI_API_KEY = 'alpha'; // duplicate, must be folded away
resetPoolForTests();

assert.equal(keyCount(), 4, 'reads every GEMINI_API_KEY* var and dedupes');

// Every key must get used, and used evenly — that is the entire point.
const counts = new Map<string, number>();
for (let i = 0; i < 400; i += 1) {
  const key = nextKey();
  assert.ok(key, 'a key is available');
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
assert.equal(counts.size, 4, 'load is spread over all four keys');
for (const [key, n] of counts) {
  assert.equal(n, 100, `key ${key} took an even share, got ${n}`);
}

// An exhausted key is benched, and comes back after the cooldown.
const benched = nextKey()!;
markExhausted(benched);
const afterBench = new Set(Array.from({ length: 30 }, () => nextKey()!));
assert.ok(!afterBench.has(benched), 'exhausted key is skipped');
assert.equal(afterBench.size, 3, 'the other three keys still rotate');
assert.ok(
  new Set(Array.from({ length: 30 }, () => nextKey(Date.now() + 61_000)!)).has(benched),
  'benched key returns once its cooldown expires'
);

// All keys down is a real state the route has to handle, not a crash.
for (const key of ['alpha', 'bravo', 'charlie', 'delta']) markExhausted(key);
assert.equal(nextKey(), null, 'returns null when every key is cooling');

resetPoolForTests();
process.env.GEMINI_API_KEYS = '';
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_API_KEY_2;
resetPoolForTests();
assert.equal(keyCount(), 0, 'no keys configured is an empty pool, not a crash');

// --- event context --------------------------------------------------------

const events = [
  event({ id: '1', eventName: 'OmegaHack' }),
  event({ id: '2', eventName: 'Hack' }),
  event({ id: '3', eventName: 'Bug Bounty Escape Room' }),
  event({ id: '4', eventName: 'PromptWars', longDescription: 'A short blurb.', shortDescription: 'A short blurb.' }),
];

assert.deepEqual(
  findMentionedEvents('tell me about OmegaHack please', events).map((e) => e.id),
  ['1'],
  'longest name wins so "Hack" does not shadow "OmegaHack"'
);
assert.deepEqual(
  findMentionedEvents('what is bug-bounty escape room about?', events).map((e) => e.id),
  ['3'],
  'punctuation and case are ignored when matching'
);
assert.deepEqual(findMentionedEvents('any cybersec events?', events), [], 'no false match on a topic query');
assert.ok(
  findMentionedEvents('anything on at 8?', events).length === 0,
  'short names are not matched, they false-positive on ordinary words'
);

const catalog = buildCatalog(events);
assert.equal(catalog.split('\n').length, 4, 'one line per event');
assert.ok(catalog.includes('OmegaHack'), 'catalog names the event');
assert.ok(catalog.includes('₹100') && catalog.includes('Nethaji Auditorium'), 'catalog carries price and venue');
assert.ok(!catalog.includes('9677123933'), 'faculty phone number never reaches the prompt');
assert.ok(!catalog.includes('faculty@vit.ac.in'), 'faculty email never reaches the prompt');
assert.ok(!catalog.includes('x.webp'), 'poster path is not wasted tokens');

assert.ok(buildEventDetails([events[0]]).includes('longer write-up'), 'details include the long description');
assert.equal(
  buildEventDetails([events[3]]),
  '',
  'no details when the long description just repeats the short one'
);

console.log('chat-selfcheck: all assertions passed');
