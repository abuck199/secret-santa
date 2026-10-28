import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { getCurrentHousehold, getMembers } from '@/server/queries/households';
import { getMyProfile } from '@/server/queries/profile';
import { getMyItems, getMyReservations } from '@/server/queries/wishlist';
import Dashboard from './dashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.dashboard') };
}

export default async function DashboardPage() {
  const household = await getCurrentHousehold();
  if (!household) return null; // the layout shows onboarding instead
  const [profile, members, mine, reservations] = await Promise.all([
    getMyProfile(),
    getMembers(household.id),
    getMyItems(household.id),
    getMyReservations(household.id),
  ]);
  return (
    <Dashboard
      householdName={household.name}
      myName={profile.displayName}
      members={members.map(({ userId, displayName, birthday, isMe }) => ({ userId, displayName, birthday, isMe }))}
      myCount={mine.length}
      reservationCount={reservations.length}
    />
  );
}
