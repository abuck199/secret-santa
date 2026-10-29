import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getT } from '@/i18n/server';
import { getCurrentHousehold, getMembers } from '@/server/queries/households';
import { getHouseholdWishlists } from '@/server/queries/wishlist';
import MemberWishlist from './member-wishlist';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.members') };
}

// One member's wishlist, where gifts get chosen. Membership is the access
// check: anyone not in the current household is a 404, like a malformed id.
export default async function MemberPage({ params }: PageProps<'/[lang]/app/members/[userId]'>) {
  const { userId } = await params;
  const household = await getCurrentHousehold();
  if (!household) return null;
  const [members, items] = await Promise.all([getMembers(household.id), getHouseholdWishlists(household.id)]);
  const member = members.find((m) => m.userId === userId);
  if (!member) notFound();
  if (member.isMe) redirect('/app/list'); // your own list is edited there, without spoilers
  return (
    <MemberWishlist
      key={`${household.id}:${userId}`}
      member={{ userId: member.userId, displayName: member.displayName, birthday: member.birthday }}
      items={items.filter((it) => it.ownerId === userId)}
    />
  );
}
