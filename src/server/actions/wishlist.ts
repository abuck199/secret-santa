'use server';

// The caller's own wishlist items. Every export here is a public POST endpoint:
// ownership is always `user_id = me` in the WHERE clause, never a client claim.

import { and, count, eq, inArray, max } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { wishlistItems } from '@/db/schema';
import { normalizeUrl } from '@/lib/url';
import { requireMember } from '../authz';
import { ActionError, runAction, type ActionResult } from '../result';
import { requireUser } from '../session';
import type { MyItem } from '../queries/wishlist';

const MAX_ITEMS = 50; // per person per household, as in the old app

const Id = z.uuid();
const ItemInput = z.object({
  item: z.string().trim().min(1).max(200),
  link: z.string().max(500).nullish(),
});

function cleanLink(link: string | null | undefined): string | null {
  const normalized = normalizeUrl(link);
  if (normalized === false) throw new ActionError('invalid_link');
  return normalized;
}

const itemColumns = {
  id: wishlistItems.id,
  item: wishlistItems.item,
  link: wishlistItems.link,
  displayOrder: wishlistItems.displayOrder,
};

export async function addItem(
  householdId: string,
  input: z.input<typeof ItemInput>,
): Promise<ActionResult<MyItem>> {
  return runAction(async () => {
    const hid = Id.parse(householdId);
    const { item, link } = ItemInput.parse(input);
    const user = await requireMember(hid);
    const mine = and(eq(wishlistItems.householdId, hid), eq(wishlistItems.userId, user.id));

    const [{ n, last }] = await db
      .select({ n: count(), last: max(wishlistItems.displayOrder) })
      .from(wishlistItems)
      .where(mine);
    if (n >= MAX_ITEMS) throw new ActionError('wishlist_full', { max: String(MAX_ITEMS) });

    const [created] = await db
      .insert(wishlistItems)
      .values({
        householdId: hid,
        userId: user.id,
        item,
        link: cleanLink(link),
        displayOrder: (last ?? -1) + 1, // new items go to the bottom
      })
      .returning(itemColumns);
    return created;
  });
}

export async function updateItem(
  itemId: string,
  input: z.input<typeof ItemInput>,
): Promise<ActionResult<MyItem>> {
  return runAction(async () => {
    const id = Id.parse(itemId);
    const { item, link } = ItemInput.parse(input);
    const user = await requireUser();
    const [updated] = await db
      .update(wishlistItems)
      .set({ item, link: cleanLink(link) })
      .where(and(eq(wishlistItems.id, id), eq(wishlistItems.userId, user.id)))
      .returning(itemColumns);
    if (!updated) throw new ActionError('not_found');
    return updated;
  });
}

export async function deleteItem(itemId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(itemId);
    const user = await requireUser();
    const deleted = await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.id, id), eq(wishlistItems.userId, user.id)))
      .returning({ id: wishlistItems.id });
    if (deleted.length === 0) throw new ActionError('not_found');
  });
}

// `orderedIds` is the caller's full list in the new order. Ids that aren't
// theirs (or not in this household) are simply not touched.
export async function reorderItems(householdId: string, orderedIds: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const hid = Id.parse(householdId);
    const ids = z.array(Id).max(MAX_ITEMS).parse(orderedIds);
    const user = await requireMember(hid);
    if (ids.length === 0) return;
    await db.transaction(async (tx) => {
      const owned = await tx
        .select({ id: wishlistItems.id })
        .from(wishlistItems)
        .where(and(
          eq(wishlistItems.householdId, hid),
          eq(wishlistItems.userId, user.id),
          inArray(wishlistItems.id, ids),
        ));
      const ownedIds = new Set(owned.map((r) => r.id));
      let order = 0;
      for (const id of ids) {
        if (!ownedIds.has(id)) continue;
        await tx.update(wishlistItems).set({ displayOrder: order++ }).where(eq(wishlistItems.id, id));
      }
    });
  });
}
