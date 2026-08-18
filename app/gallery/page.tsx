import UnderMaintenance from '../components/UnderMaintenance';
import { GALLERY_EGG_KEY } from '../hooks/useEggsFound';

export const metadata = {
  title: 'Gallery | technoVIT\'26',
};

export default function GalleryPage() {
  return <UnderMaintenance title="Gallery" eggKey={GALLERY_EGG_KEY} />;
}
