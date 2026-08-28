import ComingSoon from '../components/ComingSoon';
import UnderMaintenance from '../components/UnderMaintenance';
import { SPEAKERS_MAINTENANCE } from '../maintenance';

export const metadata = {
  title: 'Speakers | technoVIT\'26',
};

export default function SpeakersPage() {
  if (SPEAKERS_MAINTENANCE) return <UnderMaintenance title="Speakers" />;
  return <ComingSoon title="Speakers" />;
}
