'use server';

// Account deletion (Law 25: the privacy policy promises it). Every export here
// is a public POST endpoint.

import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { households, memberships, users } from '@/db/schema';
import { auth } from '@/lib/auth';
import { removeFromHousehold } from '../memberships';
import { runAction, type ActionResult } from '../result';
import { requireUser } from '../session';

// Households the user owns go to another member (an admin first, then the
// longest-standing member), who becomes owner and admin; a household with
// nobody else in it is deleted. Then the user leaves every household the usual
// way (unbought reservations released, bought ones stay taken, draw pairings
// voided) and the user row goes, cascading to profile, sessions and list.
// Unlike leaving, this overrides a running Secret Santa draw on purpose.
export async function deleteAccount(): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    // Clear the session cookie while the session still exists.
    await auth.api.signOut({ headers: await headers() });

    await db.transaction(async (tx) => {
      const owned = await tx
        .select({ id: households.id })
        .from(households)
        .where(eq(households.ownerId, user.id));
      for (const h of owned) {
        const [heir] = await tx
          .select({ userId: memberships.userId })
          .from(memberships)
          .where(and(eq(memberships.householdId, h.id), ne(memberships.userId, user.id)))
          .orderBy(sql`case when ${memberships.role} = 'admin' then 0 else 1 end`, asc(memberships.joinedAt))
          .limit(1);
        if (!heir) {
          await tx.delete(households).where(eq(households.id, h.id));
          continue;
        }
        await tx.update(households).set({ ownerId: heir.userId }).where(eq(households.id, h.id));
        await tx.update(memberships)
          .set({ role: 'admin' })
          .where(and(eq(memberships.householdId, h.id), eq(memberships.userId, heir.userId)));
      }

      const mine = await tx
        .select({ householdId: memberships.householdId })
        .from(memberships)
        .where(eq(memberships.userId, user.id));
      for (const m of mine) await removeFromHousehold(tx, m.householdId, user.id);

      await tx.delete(users).where(eq(users.id, user.id));
    });
  });
}
