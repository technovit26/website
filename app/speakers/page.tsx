import UnderMaintenance from '../components/UnderMaintenance';
import { SPEAKERS_MAINTENANCE } from '../maintenance';
import SpeakersContent from './SpeakersContent';

export const metadata = {
  title: "Guest Speakers | technoVIT'26",
};

export default function SpeakersPage() {
  if (SPEAKERS_MAINTENANCE) return <UnderMaintenance title="Guest Speakers" />;
  return <SpeakersContent />;
}
