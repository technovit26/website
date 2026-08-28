import GalleryContent from './GalleryContent';
import { fetchSpecialGalleryImages } from './data';
import UnderMaintenance from '../components/UnderMaintenance';
import { GALLERY_MAINTENANCE } from '../maintenance';

export const revalidate = 900;

export const metadata = {
  title: 'Gallery | technoVIT\'26',
};

export default async function GalleryPage() {
  if (GALLERY_MAINTENANCE) return <UnderMaintenance title="Gallery" />;

  const { images, general, debug } = await fetchSpecialGalleryImages();
  return (
    <>
      <span data-gallery-debug={debug} aria-hidden style={{ display: 'none' }} />
      <GalleryContent images={images} ambientImages={general} />
    </>
  );
}
