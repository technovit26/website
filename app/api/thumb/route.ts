import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { nearestThumbWidth } from '@/app/lib/thumbnail';

// sharp needs the Node runtime, not Edge.
export const runtime = 'nodejs';

// Only ever proxy/resize photos from our own gallery CDN — this route would
// otherwise be an open image-fetching proxy for anyone who found the URL.
const ALLOWED_HOSTS = new Set(['gallery.techno.cdn.a2ys.dev']);

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

// Source photos are shot at ~24MP; re-encoded thumbnails are tiny, so caching
// this aggressively at the edge is what keeps this route from being called
// more than once per (photo, width) pair.
const CACHE_CONTROL =
  'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=2592000';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const src = searchParams.get('src');
  const requestedWidth = Number(searchParams.get('w'));

  if (!src) {
    return NextResponse.json({ error: 'missing src' }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return NextResponse.json({ error: 'invalid src' }, { status: 400 });
  }

  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
    return NextResponse.json({ error: 'src host not allowed' }, { status: 400 });
  }

  const width = nearestThumbWidth(
    Number.isFinite(requestedWidth) && requestedWidth > 0 ? requestedWidth : 340
  );

  let upstream: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      upstream = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return NextResponse.json({ error: 'upstream fetch failed' }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: `upstream responded ${upstream.status}` }, { status: 502 });
  }

  const contentLength = Number(upstream.headers.get('content-length') ?? '0');
  if (contentLength > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: 'source image too large' }, { status: 413 });
  }

  const original = Buffer.from(await upstream.arrayBuffer());
  if (original.byteLength > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: 'source image too large' }, { status: 413 });
  }

  try {
    const resized = await sharp(original)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();

    return new NextResponse(new Uint8Array(resized), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch {
    return NextResponse.json({ error: 'resize failed' }, { status: 500 });
  }
}
