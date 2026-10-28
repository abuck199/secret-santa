import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { getCurrentHousehold } from '@/server/queries/households';
import { getMyReservations } from '@/server/queries/wishlist';
import ReservationsList from './reservations-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.reservations') };
}

export default async function ReservationsPage() {
  const household = await getCurrentHousehold();
  if (!household) return null;
  const rows = await getMyReservations(household.id);
  return <ReservationsList key={household.id} initialRows={rows} />;
}
