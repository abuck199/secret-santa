'use server';

// Households and their members. Every export here is a public POST endpoint:
// validate input, derive the user from the session, check the role.

import { and, eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { assignments, households, memberships } from '@/db/schema';
import { requireAdmin, requireMember } from '../authz';
import { removeFromHousehold } from '../memberships';
import { ActionError, runAction, type ActionResult } from '../result';
import { requireUser } from '../session';

const Id = z.uuid();
const Name = z.string().trim().min(1).max(60);

async function getOwnerId(householdId: string) {
  const [h] = await db
    .select({ ownerId: households.ownerId })
    .from(households)
    .where(eq(households.id, householdId));
  if (!h) throw new ActionError('not_found');
  return h.ownerId;
}

// True while Secret Santa is on and this user gives or receives in the draw.
async function isInActiveDraw(householdId: string, userId: string) {
  const [row] = await db
    .select({ id: assignments.id })
    .from(assignments)
    .innerJoin(households, eq(households.id, assignments.householdId))
    .where(and(
      eq(assignments.householdId, householdId),
      eq(households.secretSantaEnabled, true),
      or(eq(assignments.giverId, userId), eq(assignments.receiverId, userId)),
    ))
    .limit(1);
  return !!row;
}

/* --------------------------- Households -------------------------- */

// Replaces the `create_household` RPC.
export async function createHousehold(name: string): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const user = await requireUser();
    const cleanName = Name.parse(name);
    return db.transaction(async (tx) => {
      const [h] = await tx
        .insert(households)
        .values({ name: cleanName, ownerId: user.id })
        .returning({ id: households.id });
      await tx.insert(memberships).values({ householdId: h.id, userId: user.id, role: 'admin' });
      return { id: h.id };
    });
  });
}

export async function renameHousehold(householdId: string, name: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const cleanName = Name.parse(name);
    await requireAdmin(id);
    await db.update(households).set({ name: cleanName }).where(eq(households.id, id));
  });
}

export async function setSecretSanta(householdId: string, enabled: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const on = z.boolean().parse(enabled);
    await requireAdmin(id);
    await db.update(households).set({ secretSantaEnabled: on }).where(eq(households.id, id));
  });
}

// Owner only: cascades to members, lists, invites and the draw.
export async function deleteHousehold(householdId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const user = await requireMember(id);
    if ((await getOwnerId(id)) !== user.id) throw new ActionError('forbidden');
    await db.delete(households).where(eq(households.id, id));
  });
}

// The owner can't leave (it would orphan the household); they delete it instead.
// Nobody can walk out of a running Secret Santa draw either: an admin turns
// Secret Santa off once the season is over, or removes them deliberately.
export async function leaveHousehold(householdId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const user = await requireMember(id);
    if ((await getOwnerId(id)) === user.id) throw new ActionError('owner_cannot_leave');
    if (await isInActiveDraw(id, user.id)) throw new ActionError('in_active_draw');
    await db.transaction((tx) => removeFromHousehold(tx, id, user.id));
  });
}

/* ---------------------------- Members ---------------------------- */

// Loads a membership and checks the caller may manage it: admin of that
// household, not themselves (use leave), and never the owner.
async function requireManageableMember(membershipId: string) {
  const id = Id.parse(membershipId);
  const [m] = await db
    .select({ householdId: memberships.householdId, userId: memberships.userId })
    .from(memberships)
    .where(eq(memberships.id, id));
  if (!m) throw new ActionError('not_found');
  const admin = await requireAdmin(m.householdId);
  if (m.userId === admin.id) throw new ActionError('cannot_change_self');
  if ((await getOwnerId(m.householdId)) === m.userId) throw new ActionError('cannot_change_owner');
  return { id, ...m };
}

export async function setMemberRole(
  membershipId: string,
  role: 'admin' | 'member',
): Promise<ActionResult> {
  return runAction(async () => {
    const newRole = z.enum(['admin', 'member']).parse(role);
    const m = await requireManageableMember(membershipId);
    await db.update(memberships).set({ role: newRole }).where(eq(memberships.id, m.id));
  });
}

export async function removeMember(membershipId: string): Promise<ActionResult> {
  return runAction(async () => {
    const m = await requireManageableMember(membershipId);
    await db.transaction((tx) => removeFromHousehold(tx, m.householdId, m.userId));
  });
}
