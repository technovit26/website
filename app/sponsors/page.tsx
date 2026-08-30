import UnderMaintenance from '../components/UnderMaintenance';
import { SPONSORS_MAINTENANCE } from '../maintenance';
import SponsorsContent from './SponsorsContent';

export const metadata = {
  title: "Sponsors | technoVIT'26",
};

export default function SponsorsPage() {
  if (SPONSORS_MAINTENANCE) return <UnderMaintenance title="Sponsors" />;
  return <SponsorsContent />;
}
