import GalleryContent from './GalleryContent';
import { fetchSpecialGalleryImages } from './data';

export const revalidate = 300;

export const metadata = {
  title: 'Gallery | technoVIT\'26',
};

export default async function GalleryPage() {
  const specialImages = await fetchSpecialGalleryImages();
  return <GalleryContent images={specialImages} />;
}
