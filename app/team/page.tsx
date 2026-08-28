import TeamContent from './TeamContent';
import UnderMaintenance from '../components/UnderMaintenance';
import { TEAM_MAINTENANCE } from '../maintenance';

export const metadata = {
  title: 'Team | technoVIT\'26',
};

export default function TeamPage() {
  if (TEAM_MAINTENANCE) return <UnderMaintenance title="Team" />;
  return <TeamContent />;
}
