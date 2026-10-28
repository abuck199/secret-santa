// Reads for Server Components: the caller's households and their members.

import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { households, memberships, profiles } from '@/db/schema';
import { requireMember } from '../authz';
import { requireUser } from '../session';

export type MyHousehold = {
  id: string;
  name: string;
  secretSantaEnabled: boolean;
  role: 'admin' | 'member';
  isOwner: boolean;
};

export async function getMyHouseholds(): Promise<MyHousehold[]> {
  const user = await requireUser();
  const rows = await db
    .select({
      id: households.id,
      name: households.name,
      secretSantaEnabled: households.secretSantaEnabled,
      ownerId: households.ownerId,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(households, eq(households.id, memberships.householdId))
    .where(eq(memberships.userId, user.id));
  return rows
    .map(({ ownerId, ...h }) => ({ ...h, isOwner: ownerId === user.id }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type Member = {
  membershipId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  displayName: string;
  birthday: string | null;
  isOwner: boolean;
  isMe: boolean;
};

export async function getMembers(householdId: string): Promise<Member[]> {
  const user = await requireMember(householdId);
  const rows = await db
    .select({
      membershipId: memberships.id,
      userId: memberships.userId,
      role: memberships.role,
      joinedAt: memberships.joinedAt,
      displayName: profiles.displayName,
      birthday: profiles.birthday,
      ownerId: households.ownerId,
    })
    .from(memberships)
    .innerJoin(households, eq(households.id, memberships.householdId))
    .leftJoin(profiles, eq(profiles.id, memberships.userId))
    .where(eq(memberships.householdId, householdId));
  return rows
    .map(({ ownerId, ...m }) => ({
      ...m,
      displayName: m.displayName ?? '',
      isOwner: m.userId === ownerId,
      isMe: m.userId === user.id,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
