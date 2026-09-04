const GALLERY_ENDPOINT = 'https://api.techno.cdn.a2ys.dev/gallery';
const REVALIDATE_SECONDS = 900;

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

// technoVIT'26 core memories (frames featured in the "Core Memories" grid).
// Added as static special images so the featured frames are always shown.
const CORE_MEMORY_URLS: string[] = [
  'https://cdn.puang.in/images/photos/2263d05c-da6f-4e71-adf5-319f06f68741-SS8_1649.webp',
  'https://cdn.puang.in/images/photos/0a35bebb-b65a-4e99-8442-dfd28f8afa50-SS8_1636.webp',
  'https://cdn.puang.in/images/photos/1e9f79c1-8969-4805-953f-69fae60c694b-SS8_1634.webp',
  'https://cdn.puang.in/images/photos/102742a5-8208-4ed5-a703-6e088920f58d-SS8_1632.webp',
  'https://cdn.puang.in/images/photos/9cc1ed45-2741-4732-84af-6cecadf29ffa-SS8_1471.webp',
  'https://cdn.puang.in/images/photos/f7de77d1-4858-4b79-9486-9882c0747b90-SS8_1467.webp',
  'https://cdn.puang.in/images/photos/dc830846-55a3-4311-83da-a41aa82ee7d5-SS8_1461.webp',
  'https://cdn.puang.in/images/photos/ec4cf541-c435-4904-84e2-a929354101d2-SS8_1460.webp',
  'https://cdn.puang.in/images/photos/da7bf0e9-fc88-46e3-9d64-c13d40aa613a-SS8_1456.webp',
  'https://cdn.puang.in/images/photos/8f01102e-c7c2-41d7-9fb4-f824a9526563-SS8_1442.webp',
  'https://cdn.puang.in/images/photos/34e871ab-0c53-4b9e-99b3-fed04816fea1-SS8_1434.webp',
  'https://cdn.puang.in/images/photos/1014f17f-f0ec-4374-be15-acf2b3c874f2-SS8_1310.webp',
  'https://cdn.puang.in/images/photos/4d3317cb-776b-4657-b32a-820fd3781b80-SS8_1289.webp',
  'https://cdn.puang.in/images/photos/b1f9523a-ac73-4f03-b590-28f95eb51666-SS8_1192.webp',
  'https://cdn.puang.in/images/photos/554eff2e-5e44-42e1-838a-feb36889a1f6-IMG_0389.webp',
  'https://cdn.puang.in/images/photos/6fea6875-d8e0-46e0-9b48-6f8c7c47624d-IMG_0388.webp',
  'https://cdn.puang.in/images/photos/6610edd4-44d6-4222-9aa2-ac6903930e1b-IMG_0386.webp',
  'https://cdn.puang.in/images/photos/019ddfce-2da6-447e-819e-7270c1633dbe-IMG_0384.webp',
  'https://cdn.puang.in/images/photos/9e5cffcd-9b0a-4bfa-8904-ceb41c198100-IMG_0383.webp',
  'https://cdn.puang.in/images/photos/e3dfc060-5551-4d73-90f3-af61638dc516-IMG_0382.webp',
  'https://cdn.puang.in/images/photos/628cd2b1-b37a-48da-9eec-601e3b23b316-IMG_0381.webp',
  'https://cdn.puang.in/images/photos/27e331d3-9cdd-4f52-9f06-218e9aebd6a5-IMG_0380.webp',
  'https://cdn.puang.in/images/photos/f76b72d0-4978-4383-b071-8021945a9ecb-IMG_0379.webp',
  'https://cdn.puang.in/images/photos/95cbf11d-9d59-460f-a269-cdbc85086fe8-IMG_0378.webp',
  'https://cdn.puang.in/images/photos/49eb51fb-e761-4af4-9bdc-90ebb19b1476-IMG_0377.webp',
  'https://cdn.puang.in/images/photos/9cf10ed3-a777-4782-9a29-f06a07a00f2f-IMG_0376.webp',
  'https://cdn.puang.in/images/photos/581a293c-782e-46d9-80d5-5b29d34da175-IMG_0375.webp',
  'https://cdn.puang.in/images/photos/7ebc2ee8-5af1-4398-8c70-76a9fecdd9ce-IMG_0374.webp',
  'https://cdn.puang.in/images/photos/a34a4ed9-0a75-46f9-8892-468539746ecc-IMG_0373.webp',
  'https://cdn.puang.in/images/photos/25b4e972-2508-4ae5-8d27-a5f03bdf8d2a-IMG_0372.webp',
  'https://cdn.puang.in/images/photos/2a36a7d6-fc01-4396-98e6-99cc677476b5-IMG_0371.webp',
];

export async function fetchSpecialGalleryImages(): Promise<GalleryFetchResult> {
  const core = CORE_MEMORY_URLS.map((url) => ({ url, isSpecial: true }));
  try {
    const res = await fetch(GALLERY_ENDPOINT, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      const debug = `fetch failed: ${res.status} ${res.statusText}`;
      console.error(`[gallery] ${debug}`);
      return { images: core, general: [], debug };
    }
    const data: GalleryResponse = await res.json();
    const all = data.images ?? [];
    const general = all.filter((img) => img.isSpecial === false);
    return { images: core, general, debug: `ok: ${all.length} total, ${core.length} core` };
  } catch (err) {
    const debug = `fetch threw: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[gallery] ${debug}`);
    return { images: core, general: [], debug };
  }
}
