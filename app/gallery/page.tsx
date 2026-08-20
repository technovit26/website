import GalleryContent from './GalleryContent';
import { fetchSpecialGalleryImages } from './data';

export const revalidate = 300;

export const metadata = {
  title: 'Gallery | technoVIT\'26',
};

export default async function GalleryPage() {
  const { images, debug } = await fetchSpecialGalleryImages();
  return (
    <>
      <span data-gallery-debug={debug} aria-hidden style={{ display: 'none' }} />
      <GalleryContent images={images} />
    </>
  );
}
