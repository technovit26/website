import ProfileContent from './ProfileContent';
import UnderMaintenance from '../components/UnderMaintenance';
import { PROFILE_MAINTENANCE } from '../maintenance';

export const metadata = {
  title: "Profile | technoVIT'26",
};

export default function ProfilePage() {
  if (PROFILE_MAINTENANCE) return <UnderMaintenance title="Profile" />;
  return <ProfileContent />;
}
