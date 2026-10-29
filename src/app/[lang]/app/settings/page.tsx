import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { getCurrentHousehold, getMembers } from '@/server/queries/households';
import { getInvites } from '@/server/queries/invites';
import { getSantaAdmin } from '@/server/queries/santa';
import HouseholdSettings from './household-settings';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.settings') };
}

export default async function SettingsPage() {
  const household = await getCurrentHousehold();
  if (!household) return null;
  const isAdmin = household.role === 'admin';
  const [members, invites, santa] = await Promise.all([
    getMembers(household.id),
    isAdmin ? getInvites(household.id) : Promise.resolve([]),
    isAdmin ? getSantaAdmin(household.id) : Promise.resolve(null),
  ]);
  return (
    <HouseholdSettings
      key={household.id}
      household={household}
      initialMembers={members}
      initialInvites={invites}
      initialSanta={santa}
    />
  );
}
