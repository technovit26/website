const GALLERY_API = 'https://api.techno.cdn.a2ys.dev/gallery';
const GALLERY_CDN_ORIGIN = 'https://gallery.techno.cdn.a2ys.dev';

const WARM_WIDTHS = [340, 460];
const CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 20_000;
const ACCEPT = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';

function thumbUrl(src, width) {
  let path;
  try {
    path = new URL(src).pathname;
  } catch {
    path = src.startsWith('/') ? src : `/${src}`;
  }
  return `${GALLERY_CDN_ORIGIN}/cdn-cgi/image/width=${width},quality=72,format=auto${path}`;
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function runPool(items, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      await worker(queue.shift());
    }
  });
  await Promise.all(runners);
}

async function main() {
  let images;
  try {
    const res = await fetchWithTimeout(GALLERY_API);
    if (!res.ok) {
      console.warn(`[prewarm] gallery list responded ${res.status} — skipping`);
      return;
    }
    const data = await res.json();
    images = Array.isArray(data?.images) ? data.images : [];
  } catch (err) {
    console.warn(`[prewarm] could not fetch gallery list: ${err?.message ?? err} — skipping`);
    return;
  }

  const targets = [];
  for (const img of images) {
    if (!img?.url) continue;
    for (const w of WARM_WIDTHS) targets.push(thumbUrl(img.url, w));
  }

  if (targets.length === 0) {
    console.log('[prewarm] nothing to warm');
    return;
  }

  const started = Date.now();
  let ok = 0;
  let hit = 0;
  let failed = 0;

  await runPool(targets, async (url) => {
    try {
      const res = await fetchWithTimeout(url, { headers: { Accept: ACCEPT } });
      if (res.ok) {
        ok += 1;
        if ((res.headers.get('cf-cache-status') ?? '').toUpperCase() === 'HIT') hit += 1;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  });

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[prewarm] ${targets.length} URLs · ${ok} ok (${hit} already cached) · ${failed} failed · ${secs}s`,
  );
}

main()
  .catch((err) => {
    console.warn(`[prewarm] unexpected error: ${err?.message ?? err}`);
  })
  .finally(() => {
    process.exit(0);
  });
