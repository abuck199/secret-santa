import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { getCurrentHousehold } from '@/server/queries/households';
import { getMyItems } from '@/server/queries/wishlist';
import WishlistEditor from './wishlist-editor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.wishlist') };
}

export default async function WishlistPage() {
  const household = await getCurrentHousehold();
  if (!household) return null;
  const items = await getMyItems(household.id);
  // `key`: switching household starts from that household's list.
  return (
    <WishlistEditor key={household.id} householdId={household.id} householdName={household.name} initialItems={items} />
  );
}
