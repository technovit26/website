const GALLERY_ENDPOINT = 'https://api.techno.cdn.a2ys.dev/gallery';
const REVALIDATE_SECONDS = 300;

export interface GalleryImage {
  url: string;
  isSpecial: boolean;
}

interface GalleryResponse {
  images: GalleryImage[];
}

export async function fetchSpecialGalleryImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(GALLERY_ENDPOINT, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.error(`[gallery] fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const data: GalleryResponse = await res.json();
    return (data.images ?? []).filter((img) => img.isSpecial);
  } catch (err) {
    console.error('[gallery] fetch threw', err);
    return [];
  }
}
