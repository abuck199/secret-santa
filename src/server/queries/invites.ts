// Reads for Server Components: a household's invite links and who used them.

import 'server-only';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { inviteRedemptions, invites, profiles } from '@/db/schema';
import { requireAdmin } from '../authz';

export type Invite = {
  id: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  createdByMe: boolean;
  creatorName: string;
  joiners: { userId: string; name: string; joinedAt: Date }[];
};

// Admin only (was the `get_invite_redemptions` RPC + a plain select).
export async function getInvites(householdId: string): Promise<Invite[]> {
  const user = await requireAdmin(householdId);
  const rows = await db
    .select({
      id: invites.id,
      code: invites.code,
      createdAt: invites.createdAt,
      expiresAt: invites.expiresAt,
      invitedBy: invites.invitedBy,
      creatorName: profiles.displayName,
    })
    .from(invites)
    .leftJoin(profiles, eq(profiles.id, invites.invitedBy))
    .where(eq(invites.householdId, householdId))
    .orderBy(desc(invites.createdAt));
  if (rows.length === 0) return [];

  const redemptions = await db
    .select({
      inviteId: inviteRedemptions.inviteId,
      userId: inviteRedemptions.userId,
      joinedAt: inviteRedemptions.joinedAt,
      name: profiles.displayName,
    })
    .from(inviteRedemptions)
    .leftJoin(profiles, eq(profiles.id, inviteRedemptions.userId))
    .where(inArray(inviteRedemptions.inviteId, rows.map((r) => r.id)))
    .orderBy(inviteRedemptions.joinedAt);

  const now = new Date();
  return rows.map(({ invitedBy, ...r }) => ({
    ...r,
    isExpired: r.expiresAt <= now,
    createdByMe: invitedBy === user.id,
    creatorName: r.creatorName ?? '',
    joiners: redemptions
      .filter((j) => j.inviteId === r.id)
      .map(({ userId, name, joinedAt }) => ({ userId, name: name ?? '', joinedAt })),
  }));
}
