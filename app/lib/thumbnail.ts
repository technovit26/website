// Widths the /api/thumb route is allowed to produce. Requests snap to the
// nearest value so the resize cache (and Vercel's edge cache) only ever holds
// a handful of variants per source photo, instead of one per arbitrary width.
export const THUMB_WIDTHS = [172, 240, 340, 460, 680, 920] as const;

export function nearestThumbWidth(target: number): number {
  return THUMB_WIDTHS.reduce((best, w) =>
    Math.abs(w - target) < Math.abs(best - target) ? w : best
  );
}

export function thumbUrl(src: string, targetWidth: number): string {
  const width = nearestThumbWidth(targetWidth);
  return `/api/thumb?src=${encodeURIComponent(src)}&w=${width}`;
}
