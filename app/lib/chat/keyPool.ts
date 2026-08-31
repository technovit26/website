// Gemini free-tier quota is per API key, so the only way to serve a fest-sized
// crowd is to spread every request across all keys in the environment.
//
// Keys are read from any env var named GEMINI_API_KEY, GEMINI_API_KEYS, or
// GEMINI_API_KEY_<n>. Each may hold one key or several separated by commas or
// whitespace, so adding capacity never needs a code change.

const COOLDOWN_MS = 60_000;
const KEY_VAR = /^GEMINI_API_KEYS?(_\d+)?$/;

type PooledKey = { value: string; cooldownUntil: number };

let pool: PooledKey[] | null = null;
let cursor = 0;

function readKeysFromEnv(): string[] {
  const found = new Set<string>();
  for (const [name, raw] of Object.entries(process.env)) {
    if (!raw || !KEY_VAR.test(name)) continue;
    for (const key of raw.split(/[\s,]+/)) {
      if (key) found.add(key);
    }
  }
  return [...found];
}

function getPool(): PooledKey[] {
  if (!pool) {
    pool = readKeysFromEnv().map((value) => ({ value, cooldownUntil: 0 }));
    // Start each serverless isolate at a different offset. Without this every
    // cold start begins at key 0 and the rotation is only theoretical.
    cursor = pool.length > 0 ? Math.floor(Math.random() * pool.length) : 0;
  }
  return pool;
}

export function keyCount(): number {
  return getPool().length;
}

/** Next key in round-robin order, skipping any that recently hit its quota. */
export function nextKey(now = Date.now()): string | null {
  const keys = getPool();
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[cursor % keys.length];
    cursor = (cursor + 1) % keys.length;
    if (key.cooldownUntil <= now) return key.value;
  }
  return null;
}

/** Bench a key that returned 429/quota-exhausted so it is skipped for a while. */
export function markExhausted(value: string, now = Date.now()): void {
  const key = getPool().find((k) => k.value === value);
  if (key) key.cooldownUntil = now + COOLDOWN_MS;
}

// ponytail: pool state is per-isolate and in-memory, so rotation is only
// approximately fair across a fleet and cooldowns are not shared. Fine for a
// one-week fest; move to KV or Durable Objects if it ever needs to be exact.
export function resetPoolForTests(): void {
  pool = null;
  cursor = 0;
}
