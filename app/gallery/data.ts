const GALLERY_ENDPOINT = 'https://api.techno.cdn.a2ys.dev/gallery';
const REVALIDATE_SECONDS = 300;

export interface GalleryImage {
  url: string;
  isSpecial: boolean;
}

interface GalleryResponse {
  images: GalleryImage[];
}

export interface GalleryFetchResult {
  images: GalleryImage[];
  general: GalleryImage[];
  debug: string;
}

export async function fetchSpecialGalleryImages(): Promise<GalleryFetchResult> {
  try {
    const res = await fetch(GALLERY_ENDPOINT, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      const debug = `fetch failed: ${res.status} ${res.statusText}`;
      console.error(`[gallery] ${debug}`);
      return { images: [], general: [], debug };
    }
    const data: GalleryResponse = await res.json();
    const all = data.images ?? [];
    const special = all.filter((img) => img.isSpecial);
    const general = all.filter((img) => img.isSpecial === false);
    return { images: special, general, debug: `ok: ${all.length} total, ${special.length} special` };
  } catch (err) {
    const debug = `fetch threw: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[gallery] ${debug}`);
    return { images: [], general: [], debug };
  }
}
