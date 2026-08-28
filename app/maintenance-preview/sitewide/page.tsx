import SiteMaintenance from '../../components/SiteMaintenance';
import NativeCursorPreview from './NativeCursorPreview';

export const metadata = {
  title: 'Preview · Sitewide Maintenance',
};

export default function SitewideMaintenancePreview() {
  return (
    <div className="fixed inset-0 z-[2147483647] overflow-y-auto bg-[#064928]">
      <NativeCursorPreview />
      <SiteMaintenance />
    </div>
  );
}
