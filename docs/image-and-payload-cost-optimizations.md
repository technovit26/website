# Image & payload cost optimizations — deferred backlog

Last updated: 2026-08-28

## What this is

Three optimizations identified during a perf/cost pass on `/events` and `/gallery`.
They were **not** applied — each is either an infra change or a payload refactor that
needs a decision. The smaller quick-wins from the same pass (dot-matrix scanlines,
lightbox → cached thumbnail, `revalidate` 300 → 900, `content-visibility` on the
completed-events list, `THUMB_WIDTHS` trim, `bg.svg` SVGO) are already done.

Background: images are served through a custom `app/api/thumb/route.ts` (Node runtime,
`sharp`, outputs WebP q72, `Cache-Control: max-age=604800, s-maxage=2592000,
stale-while-revalidate=2592000`). This route deliberately avoids Vercel Image
Optimization (which bills per source image). Gallery source photos live on
`gallery.techno.cdn.a2ys.dev` (Cloudflare). Event data comes from
`techno.worker.puang.in/events`, gallery list from `api.techno.cdn.a2ys.dev/gallery`.

---

## 1. Move image resizing off Vercel onto Cloudflare  — biggest lever

### Problem

Every cold thumbnail today is: Cloudflare origin → **Vercel** (transfers the *full
~24 MP original*) → `sharp` resize (Node serverless compute) → user. Costs incurred on
Vercel: function invocations, GB-seconds of `sharp` compute, and inbound bandwidth for
every original. The 30-day edge cache absorbs repeat hits, but first-hit-per-(photo,
width) pays the full price, and the ambient gallery wall alone can request ~40 distinct
thumbs.

### Proposed change

If `gallery.techno.cdn.a2ys.dev` is on a Cloudflare zone with **Image Resizing**
enabled, replace `/api/thumb` with URL-based transforms:

```
https://gallery.techno.cdn.a2ys.dev/cdn-cgi/image/width=460,quality=72,format=auto/<path>
```

- `app/lib/thumbnail.ts` — `thumbUrl()` builds the `/cdn-cgi/image/...` URL instead of
  `/api/thumb?src=...&w=...`. `THUMB_WIDTHS` / `nearestThumbWidth()` can stay (still
  worth snapping to a few widths so CF caches a bounded set).
- Delete `app/api/thumb/route.ts` and the `sharp` dependency.
- `format=auto` gives AVIF/WebP negotiation for free (currently WebP only).

### Effect

Eliminates the Vercel function entirely: no invocations, no `sharp` GB-seconds, no
CF→Vercel transfer of originals. CF Image Resizing bills per unique transformation and
is far cheaper for this workload.

### Caveats / open questions

- Requires Image Resizing on the CF plan for that zone (Pro+, or the newer
  Images/Transformations pricing). Confirm it's available and what it costs there.
- The current route also enforces `ALLOWED_HOSTS`, a 20 MB source cap, and EXIF
  rotation (`.rotate()`). CF Image Resizing handles orientation; the host allowlist
  becomes moot (transforms are same-origin to the zone).
- If Image Resizing is **not** available: fallback is a Cloudflare **Worker** with the
  `images` binding doing the same resize at the edge — still removes the Vercel
  compute, more setup.

---

## 2. Pre-warm thumbnails at deploy

### Problem

Whatever resizer we use, the *first real visitor* after a deploy (or after a cache
purge / new photos landing in the feed) pays the cold resize latency for every
thumbnail they scroll past.

### Proposed change

A post-deploy script that fetches every gallery image at the widths actually used
(`340` ambient, `460` core grid; `920` lazily is fine to skip) so the edge cache is
warm before anyone hits the page.

- New `scripts/prewarm-thumbs.mjs`: fetch `api.techno.cdn.a2ys.dev/gallery`, then for
  each image `fetch(thumbUrl(img.url, 340))` and `fetch(thumbUrl(img.url, 460))` with
  a small concurrency limit.
- Wire into `package.json` as a `postbuild` step, or a Vercel deploy hook, or a cron
  (GitHub Actions / Vercel Cron) that also catches newly-added photos between deploys.

### Effect

Turns every gallery thumbnail into a warm-cache hit for real users. Pairs naturally
with #1 (pre-warm the `/cdn-cgi/image/` URLs instead).

### Caveats

- Adds N resize operations per deploy/cron run — but these would happen anyway on
  first visit; this just shifts them off the user's critical path. Keep the width list
  minimal so it's bounded.

---

## 3. Trim the events RSC payload

### Problem

`app/events/page.tsx` does `await fetchEvents()` and passes the entire array (150+
events, full `EventItem` each) into `<EventsContent>`, a client component. That whole
array is serialized into the RSC/HTML payload and re-parsed on hydration. The card +
list only read ~8 fields; `longDescription`, `facultyCoordEmpId`,
`facultyCoordName/Mobile/Email`, `registrationLink` are only needed once a specific
event's modal opens.

### Proposed change

Split the shape:

- `fetchEvents()` (or a new `fetchEventsList()`) returns a slim `EventListItem` — the
  fields the grid/filters/sort use (`id`, `eventName`, `clubName`, `eventType`,
  `eventFor`, `posterPath`, `startDateTime`, `endDateTime`, `pricePerPerson`,
  `participationType`, `teamSize`, `eventVenue`, `shortDescription`, `isSpecialEvent`).
- The modal (`EventModal`) fetches the full record for one event on open — either a new
  `/api/technovit/events/[id]` route, or a `fetchEventById()` server action, or just
  include the heavy fields in a second parallel payload that hydrates lazily.
- `EventItem` stays as the full shape for the modal path.

### Effect

Shrinks the events page HTML + hydration payload (dominant cost is `longDescription`
across 150 rows). Bytes saved on every events visit; no infra change.

### Caveats

- Adds a fetch on modal-open (network round-trip before the long description shows).
  Mitigate with a skeleton, or prefetch the full record on card hover.
- The deep-link case (`/events?event=<id>`) currently resolves `activeEvent` from the
  already-present array — that path would need the by-id fetch too.
- Marginal win compared to #1; do it only if the events payload shows up as a real
  cost in a production trace.

---

## Suggested order

1. **#1** if CF Image Resizing is available — it's the structural win and makes #2
   trivial.
2. **#2** right after, so deploys stay warm.
3. **#3** only if a production profile flags the events payload.
