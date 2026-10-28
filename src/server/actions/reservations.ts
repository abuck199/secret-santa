'use server';

// Quietly reserving other people's gifts. Every export here is a public POST
// endpoint. Replaces the `reserve_item`, `cancel_reservation` and
// `set_purchased` RPCs; each is a single conditional UPDATE, so two people
// reserving the same gift at once can't both win.

import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { wishlistItems } from '@/db/schema';
import { requireMember } from '../authz';
import { ActionError, runAction, type ActionResult } from '../result';
import { requireUser } from '../session';

const Id = z.uuid();

export async function reserveItem(itemId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(itemId);
    const [item] = await db
      .select({ householdId: wishlistItems.householdId, ownerId: wishlistItems.userId })
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id));
    if (!item) throw new ActionError('not_found');
    const user = await requireMember(item.householdId);
    if (item.ownerId === user.id) throw new ActionError('own_item');

    const reserved = await db
      .update(wishlistItems)
      .set({ claimed: true, reservedBy: user.id, purchased: false })
      .where(and(
        eq(wishlistItems.id, id),
        eq(wishlistItems.claimed, false),
        ne(wishlistItems.userId, user.id),
      ))
      .returning({ id: wishlistItems.id });
    if (reserved.length === 0) throw new ActionError('already_reserved');
  });
}

// Only the person who reserved it can let it go; it returns to the pool.
export async function cancelReservation(itemId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(itemId);
    const user = await requireUser();
    const released = await db
      .update(wishlistItems)
      .set({ claimed: false, reservedBy: null, purchased: false })
      .where(and(eq(wishlistItems.id, id), eq(wishlistItems.reservedBy, user.id)))
      .returning({ id: wishlistItems.id });
    if (released.length === 0) throw new ActionError('not_found');
  });
}

export async function setPurchased(itemId: string, value: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(itemId);
    const purchased = z.boolean().parse(value);
    const user = await requireUser();
    const updated = await db
      .update(wishlistItems)
      .set({ purchased })
      .where(and(eq(wishlistItems.id, id), eq(wishlistItems.reservedBy, user.id)))
      .returning({ id: wishlistItems.id });
    if (updated.length === 0) throw new ActionError('not_found');
  });
}
