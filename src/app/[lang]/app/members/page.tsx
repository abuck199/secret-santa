import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { getCurrentHousehold, getMembers } from '@/server/queries/households';
import { getHouseholdWishlists } from '@/server/queries/wishlist';
import MembersList from './members-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.members') };
}

export default async function MembersPage() {
  const household = await getCurrentHousehold();
  if (!household) return null;
  const [members, items] = await Promise.all([getMembers(household.id), getHouseholdWishlists(household.id)]);
  return (
    <MembersList
      key={household.id}
      members={members.map(({ userId, displayName, birthday, role, isMe }) => ({ userId, displayName, birthday, role, isMe }))}
      initialItems={items}
    />
  );
}
