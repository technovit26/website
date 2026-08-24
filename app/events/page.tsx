import { Suspense } from 'react';
import EventsContent from './EventsContent';
import { fetchEvents } from './data';

export const revalidate = 300;

export const metadata = {
  title: 'Events | technoVIT\'26',
};

export default async function EventsPage() {
  const events = await fetchEvents();
  return (
    <Suspense>
      <EventsContent events={events} />
    </Suspense>
  );
}
