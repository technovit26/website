import { Suspense } from 'react';
import EventsContent from './EventsContent';
import { fetchEventsList } from './data';
import UnderMaintenance from '../components/UnderMaintenance';
import { EVENTS_MAINTENANCE } from '../maintenance';

export const revalidate = 900;

export const metadata = {
  title: 'Events | technoVIT\'26',
};

export default async function EventsPage() {
  if (EVENTS_MAINTENANCE) return <UnderMaintenance title="Events" />;

  const events = await fetchEventsList();
  return (
    <Suspense>
      <EventsContent events={events} />
    </Suspense>
  );
}
