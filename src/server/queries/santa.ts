// Reads for Server Components: who the caller draws in Secret Santa, and the
// admin's view of the draw (its state and exclusions, never the pairs).

import 'server-only';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { assignments, households, profiles, santaExclusions } from '@/db/schema';
import { requireAdmin, requireMember } from '../authz';

type MyAssignment = {
  receiverId: string;
  receiverName: string;
};

// Only the caller's own pairing, only once the draw is announced and while
// Secret Santa is on. Nobody, admins included, can see who drew whom.
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
      isNotNull(households.santaAnnouncedAt),
    ));
  return row ? { receiverId: row.receiverId, receiverName: row.receiverName ?? '' } : null;
}

export type SantaExclusion = { id: string; a: { id: string; name: string }; b: { id: string; name: string } };

export type SantaAdmin = {
  drawn: boolean;
  announced: boolean;
  exclusions: SantaExclusion[];
};

// Admin only. Whether a draw exists and is announced, plus the exclusions.
export async function getSantaAdmin(householdId: string): Promise<SantaAdmin> {
  await requireAdmin(householdId);
  const pa = alias(profiles, 'pa');
  const pb = alias(profiles, 'pb');
  const [[h], [drawn], rows] = await Promise.all([
    db.select({ announcedAt: households.santaAnnouncedAt }).from(households).where(eq(households.id, householdId)),
    db.select({ id: assignments.id }).from(assignments).where(eq(assignments.householdId, householdId)).limit(1),
    db
      .select({
        id: santaExclusions.id,
        aId: santaExclusions.userA,
        aName: pa.displayName,
        bId: santaExclusions.userB,
        bName: pb.displayName,
      })
      .from(santaExclusions)
      .leftJoin(pa, eq(pa.id, santaExclusions.userA))
      .leftJoin(pb, eq(pb.id, santaExclusions.userB))
      .where(eq(santaExclusions.householdId, householdId))
      .orderBy(asc(santaExclusions.createdAt)),
  ]);
  return {
    drawn: !!drawn,
    announced: !!h?.announcedAt,
    exclusions: rows.map((r) => ({
      id: r.id,
      a: { id: r.aId, name: r.aName ?? '' },
      b: { id: r.bId, name: r.bName ?? '' },
    })),
  };
}
