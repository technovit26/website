import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchEvents } from '@/app/events/data';
import { buildCatalog, buildEventDetails, findMentionedEvents } from '@/app/lib/chat/eventContext';
import { keyCount, markExhausted, nextKey } from '@/app/lib/chat/keyPool';
import { SYSTEM_PROMPT } from '@/app/lib/chat/systemPrompt';

export const maxDuration = 30;

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;

const ChatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(['user', 'model']), text: z.string().trim().min(1).max(2000) }))
    .max(10)
    .default([]),
});

const RATE_WINDOW_MS = 5 * 60_000;
const RATE_MAX = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string, now = Date.now()): boolean {
  if (hits.size > 5_000) {
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

/** Sends the request, walking the key pool past any key that is out of quota. */
async function callGemini(body: unknown): Promise<Response | null> {
  const attempts = Math.min(keyCount(), 4);
  for (let i = 0; i < attempts; i += 1) {
    const key = nextKey();
    if (!key) return null;

    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
    } catch {
      continue;
    }

    if (res.ok) return res;
    // 429 is quota, 403 is a revoked or disabled key. Both mean: try the next one.
    if (res.status === 429 || res.status === 403) {
      markExhausted(key);
      continue;
    }
    return res;
  }
  return null;
}

/** Gemini streams SSE frames; the browser just wants the text inside them. */
function toTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const frame = JSON.parse(payload);
              for (const part of frame?.candidates?.[0]?.content?.parts ?? []) {
                if (typeof part?.text === 'string') controller.enqueue(encoder.encode(part.text));
              }
            } catch {
              // Keepalive or a frame split across reads; the next chunk completes it.
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ code: 'rate_limited' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ code: 'bad_request' }, { status: 400 });
  }
  const parsed = ChatSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ code: 'bad_request' }, { status: 400 });
  }
  const { message, history } = parsed.data;

  if (keyCount() === 0) {
    return NextResponse.json({ code: 'not_configured' }, { status: 503 });
  }

  const events = await fetchEvents();
  if (events.length === 0) {
    return NextResponse.json({ code: 'events_unavailable' }, { status: 503 });
  }

  // Stable prefix first: the system prompt and the full catalog are identical on
  // every request, which is what makes them cacheable. Anything that varies —
  // today's date, the write-ups we looked up — goes in the user turn instead.
  const systemInstruction = {
    parts: [{ text: `${SYSTEM_PROMPT}\n\nEVENTS\n${buildCatalog(events)}` }],
  };

  const details = buildEventDetails(findMentionedEvents(message, events));
  const today = new Date().toLocaleDateString('en-IN', {
    dateStyle: 'full',
    timeZone: 'Asia/Kolkata',
  });
  const userTurn = [`Today is ${today}.`, details, `Question: ${message}`]
    .filter(Boolean)
    .join('\n\n');

  const res = await callGemini({
    systemInstruction,
    contents: [
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user', parts: [{ text: userTurn }] },
    ],
    generationConfig: {
      temperature: 0.3,
      // Gemini 3 thinks before answering and those tokens come out of this
      // budget. At 600 the thinking ate 576 and the answer was cut off
      // mid-sentence, so leave real headroom even though replies are short.
      maxOutputTokens: 2000,
      // Picking events out of a list this model can already see is recall, not
      // reasoning. Thinking added ~1000 tokens and 12s per reply and changed no
      // answer we tested — costly on a per-minute token quota.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  if (!res?.ok || !res.body) {
    return NextResponse.json({ code: 'ai_unavailable' }, { status: 503 });
  }

  return new Response(toTextStream(res.body), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
