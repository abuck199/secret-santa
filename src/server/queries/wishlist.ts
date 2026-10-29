// Reads for Server Components: wishlists and reservations.
//
// ANONYMITY is the core product promise:
//  - `reserved_by` never leaves the server; callers only get booleans about
//    themselves (`reservedByMe`, `purchasedByMe`).
//  - On the viewer's OWN items, `isReserved` is always false, or they would
//    see that their gift got reserved (a spoiler).

import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { profiles, wishlistItems } from '@/db/schema';
import { requireMember } from '../authz';

export type MyItem = {
  id: string;
  item: string;
  link: string | null;
  imageUrl: string | null;
  displayOrder: number;
};

export async function getMyItems(householdId: string): Promise<MyItem[]> {
  const user = await requireMember(householdId);
  return db
    .select({
      id: wishlistItems.id,
      item: wishlistItems.item,
      link: wishlistItems.link,
      imageUrl: wishlistItems.imageUrl,
      displayOrder: wishlistItems.displayOrder,
    })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.householdId, householdId), eq(wishlistItems.userId, user.id)))
    .orderBy(asc(wishlistItems.displayOrder), asc(wishlistItems.createdAt));
}

export type HouseholdItem = MyItem & {
  ownerId: string;
  isMine: boolean;
  isReserved: boolean; // always false on my own items
  reservedByMe: boolean;
  purchasedByMe: boolean;
};

// Replaces the `get_household_wishlists` RPC: every member's list, in order.
export async function getHouseholdWishlists(householdId: string): Promise<HouseholdItem[]> {
  const user = await requireMember(householdId);
  const rows = await db
    .select({
      id: wishlistItems.id,
      ownerId: wishlistItems.userId,
      item: wishlistItems.item,
      link: wishlistItems.link,
      imageUrl: wishlistItems.imageUrl,
      displayOrder: wishlistItems.displayOrder,
      claimed: wishlistItems.claimed,
      reservedBy: wishlistItems.reservedBy,
      purchased: wishlistItems.purchased,
    })
    .from(wishlistItems)
    .where(eq(wishlistItems.householdId, householdId))
    .orderBy(asc(wishlistItems.displayOrder), asc(wishlistItems.createdAt));

  // Build each row field by field so nothing sensitive can tag along.
  return rows.map((r) => {
    const isMine = r.ownerId === user.id;
    const reservedByMe = !isMine && r.reservedBy === user.id;
    return {
      id: r.id,
      ownerId: r.ownerId,
      item: r.item,
      link: r.link,
      imageUrl: r.imageUrl,
      displayOrder: r.displayOrder,
      isMine,
      isReserved: !isMine && r.claimed,
      reservedByMe,
      purchasedByMe: reservedByMe && r.purchased,
    };
  });
}

export type MyReservation = {
  id: string;
  item: string;
  link: string | null;
  imageUrl: string | null;
  purchased: boolean;
  ownerId: string;
  ownerName: string;
};

// Replaces the `get_my_reservations` RPC, scoped to one household (the old UI
// always filtered by the current household anyway).
export async function getMyReservations(householdId: string): Promise<MyReservation[]> {
  const user = await requireMember(householdId);
  const rows = await db
    .select({
      id: wishlistItems.id,
      item: wishlistItems.item,
      link: wishlistItems.link,
      imageUrl: wishlistItems.imageUrl,
      purchased: wishlistItems.purchased,
      ownerId: wishlistItems.userId,
      ownerName: profiles.displayName,
    })
    .from(wishlistItems)
    .leftJoin(profiles, eq(profiles.id, wishlistItems.userId))
    .where(and(eq(wishlistItems.householdId, householdId), eq(wishlistItems.reservedBy, user.id)))
    .orderBy(asc(profiles.displayName), asc(wishlistItems.displayOrder));
  return rows.map((r) => ({ ...r, ownerName: r.ownerName ?? '' }));
}
