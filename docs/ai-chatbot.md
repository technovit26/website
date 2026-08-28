# AI chatbot

`POST /api/chat` — answers student questions about TechnoVIT events.

## How it works

There is no vector database, no embeddings and no RAG. All 137 events fit in
the prompt:

| Piece | Tokens |
| --- | --- |
| System prompt | ~400 |
| Every event, one line each with its short description | ~13,800 |
| **Prefix sent on every request** | **~14,200** |
| Full write-up, only when a question names an event | +120–330 |

This is what makes "find me two cybersec events" work. The data has no topic
column — `event_type` is the *format* (Hackathon, Workshop, Competition, Game),
so the subject only exists in the event names and descriptions. Keyword search
cannot find it; a model reading all 137 descriptions can.

Request shape:

```
systemInstruction : system prompt + full catalog   <- identical every time
contents          : chat history
                    today's date
                    full write-ups for any event named in the question
                    the question
```

The stable part goes first on purpose. Gemini bills a repeated prefix at a
tenth of the normal rate, and that only happens if it is byte-identical, so
nothing that varies per request may go above the catalog.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `GEMINI_API_KEYS` | yes | One or more keys, separated by commas or whitespace |
| `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, … | optional | Also picked up; all sources are merged and deduped |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.0-flash-lite` |

Free-tier quota is per key, so requests are spread round-robin across every key
found. A key that returns 429 or 403 is benched for 60 seconds and the request
retries on the next key. Each serverless isolate starts at a random offset,
otherwise every cold start would hammer the first key.

Adding capacity means adding keys to the environment. No code change.

## Files

| File | Does |
| --- | --- |
| `app/api/chat/route.ts` | Validation, rate limit, prompt assembly, streaming |
| `app/lib/chat/keyPool.ts` | Key discovery, round-robin, quota cooldown |
| `app/lib/chat/eventContext.ts` | Catalog builder, event-name lookup |
| `app/lib/chat/systemPrompt.ts` | The prompt — edit this freely |
| `scripts/chat-selfcheck.ts` | `pnpm selfcheck:chat` |

## Notes

- The response is a plain UTF-8 text stream, not JSON. Read it with
  `response.body.getReader()` and append chunks as they arrive.
- Rate limit is 20 messages per IP per 5 minutes, in memory per isolate.
- Poster paths, registration links and faculty phone/email are deliberately
  kept out of the prompt. The links are identical for every event, and the
  coordinator contact details are staff PII.
- Rotating across many keys means no single key sees the prefix often enough
  for Gemini's cache to warm up. On the free tier that costs nothing, but do
  not expect the cached-token discount while rotating.
