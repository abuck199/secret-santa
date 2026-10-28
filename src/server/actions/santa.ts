'use server';

// Secret Santa draw. Every export here is a public POST endpoint.

import { randomInt } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { assignments, households, memberships } from '@/db/schema';
import { requireAdmin } from '../authz';
import { ActionError, runAction, type ActionResult } from '../result';

const MIN_MEMBERS = 3;

// Unbiased Fisher-Yates with a CSPRNG: nobody should be able to predict the
// draw from Math.random's state.
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Replaces the `shuffle_assignments` RPC. Admin only, Secret Santa must be on.
// Shuffle everyone, then pair each person with the next one in a loop
// (i -> i+1 mod n): one big cycle, so nobody ever draws themselves.
// Running it again replaces the previous draw.
export async function shuffleAssignments(householdId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = z.uuid().parse(householdId);
    await requireAdmin(id);
    await db.transaction(async (tx) => {
      // Lock the household so two admins drawing at once can't interleave.
      const [h] = await tx
        .select({ enabled: households.secretSantaEnabled })
        .from(households)
        .where(eq(households.id, id))
        .for('update');
      if (!h?.enabled) throw new ActionError('santa_disabled');

      const members = await tx
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(eq(memberships.householdId, id));
      if (members.length < MIN_MEMBERS) {
        throw new ActionError('santa_min_members', { min: String(MIN_MEMBERS) });
      }

      const order = shuffle(members.map((m) => m.userId));
      await tx.delete(assignments).where(eq(assignments.householdId, id));
      await tx.insert(assignments).values(order.map((giverId, i) => ({
        householdId: id,
        giverId,
        receiverId: order[(i + 1) % order.length],
      })));
    });
  });
}
