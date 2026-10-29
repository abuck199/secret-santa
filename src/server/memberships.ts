// Internal helpers shared by several actions. Kept out of the 'use server'
// files on purpose: anything exported from those becomes a public endpoint.

import 'server-only';
import { and, eq, or } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { assignments, memberships, santaExclusions, wishlistItems } from '@/db/schema';
import { HOUSEHOLD_COOKIE } from './queries/households';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Make `householdId` the one the app shows (after create, join or switch).
export async function rememberHousehold(householdId: string) {
  (await cookies()).set(HOUSEHOLD_COOKIE, householdId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

// Someone leaves (or is removed from) a household: drop their membership and
// their list there, and void any Secret Santa pairing or exclusion involving
// them (an admin re-draws). Gifts they reserved but had not bought go back to the pool; gifts
// they already bought stay taken (anonymously) so nobody buys a duplicate.
export async function removeFromHousehold(tx: Tx, householdId: string, userId: string) {
  await tx.delete(memberships).where(and(
    eq(memberships.householdId, householdId),
    eq(memberships.userId, userId),
  ));
  await tx.delete(wishlistItems).where(and(
    eq(wishlistItems.householdId, householdId),
    eq(wishlistItems.userId, userId),
  ));
  const theirReservations = and(
    eq(wishlistItems.householdId, householdId),
    eq(wishlistItems.reservedBy, userId),
  );
  await tx.update(wishlistItems)
    .set({ claimed: false, reservedBy: null })
    .where(and(theirReservations, eq(wishlistItems.purchased, false)));
  await tx.update(wishlistItems)
    .set({ reservedBy: null })
    .where(and(theirReservations, eq(wishlistItems.purchased, true)));
  await tx.delete(assignments).where(and(
    eq(assignments.householdId, householdId),
    or(eq(assignments.giverId, userId), eq(assignments.receiverId, userId)),
  ));
  await tx.delete(santaExclusions).where(and(
    eq(santaExclusions.householdId, householdId),
    or(eq(santaExclusions.userA, userId), eq(santaExclusions.userB, userId)),
  ));
}
