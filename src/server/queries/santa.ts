// Reads for Server Components: who the caller draws in Secret Santa.

import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { assignments, households, profiles } from '@/db/schema';
import { requireMember } from '../authz';

type MyAssignment = {
  receiverId: string;
  receiverName: string;
};

// Only the caller's own pairing, and only while Secret Santa is on. Nobody,
// admins included, can see who drew whom.
export async function getMyAssignment(householdId: string): Promise<MyAssignment | null> {
  const user = await requireMember(householdId);
  const [row] = await db
    .select({ receiverId: assignments.receiverId, receiverName: profiles.displayName })
    .from(assignments)
    .innerJoin(households, eq(households.id, assignments.householdId))
    .leftJoin(profiles, eq(profiles.id, assignments.receiverId))
    .where(and(
      eq(assignments.householdId, householdId),
      eq(assignments.giverId, user.id),
      eq(households.secretSantaEnabled, true),
    ));
  return row ? { receiverId: row.receiverId, receiverName: row.receiverName ?? '' } : null;
}
