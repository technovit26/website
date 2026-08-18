import EventsContent from './EventsContent';
import { fetchEvents } from './data';

export const revalidate = 300;

export const metadata = {
  title: 'Events | technoVIT\'26',
};

export default async function EventsPage() {
  const events = await fetchEvents();
  return <EventsContent events={events} />;
}
