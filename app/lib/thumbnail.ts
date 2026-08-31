export const THUMB_WIDTHS = [340, 460, 920] as const;

const GALLERY_CDN_ORIGIN = 'https://gallery.techno.cdn.a2ys.dev';

export function nearestThumbWidth(target: number): number {
  return THUMB_WIDTHS.reduce((best, w) =>
    Math.abs(w - target) < Math.abs(best - target) ? w : best,
  );
}

export function thumbUrl(src: string, targetWidth: number): string {
  const width = nearestThumbWidth(targetWidth);

  let path: string;
  try {
    path = new URL(src).pathname;
  } catch {
    path = src.startsWith('/') ? src : `/${src}`;
  }

  return `${GALLERY_CDN_ORIGIN}/cdn-cgi/image/width=${width},quality=72,format=auto${path}`;
}
