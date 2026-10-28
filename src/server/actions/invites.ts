'use server';

// Invite links. Every export here is a public POST endpoint: validate input,
// derive the user from the session, check the role.

import { randomBytes } from 'node:crypto';
import { and, count, eq, gt, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { households, inviteRedemptions, invites, memberships } from '@/db/schema';
import { requireAdmin } from '../authz';
import { ActionError, runAction, type ActionResult } from '../result';
import { requireUser } from '../session';

const Id = z.uuid();
const Code = z.string().trim().min(1).max(64);

// Links are multi-use until they expire (old app: "It expires in 30 days").
const INVITE_TTL_DAYS = 30;
// Max non-expired links per household (replaces the `enforce_invite_cap` trigger).
const INVITE_CAP = 5;

export async function createInvite(
  householdId: string,
): Promise<ActionResult<{ id: string; code: string; expiresAt: Date }>> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const user = await requireAdmin(id);
    return db.transaction(async (tx) => {
      // Lock the household row so two admins clicking at once can't both slip
      // under the cap.
      await tx.select({ id: households.id }).from(households)
        .where(eq(households.id, id)).for('update');
      const [{ active }] = await tx
        .select({ active: count() })
        .from(invites)
        .where(and(eq(invites.householdId, id), gt(invites.expiresAt, sql`now()`)));
      if (active >= INVITE_CAP) throw new ActionError('invite_cap', { max: String(INVITE_CAP) });

      const [invite] = await tx
        .insert(invites)
        .values({
          householdId: id,
          code: randomBytes(8).toString('hex'),
          invitedBy: user.id,
          expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
        })
        .returning({ id: invites.id, code: invites.code, expiresAt: invites.expiresAt });
      return invite;
    });
  });
}

export async function deleteInvite(inviteId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(inviteId);
    const [invite] = await db
      .select({ householdId: invites.householdId })
      .from(invites)
      .where(eq(invites.id, id));
    if (!invite) throw new ActionError('not_found');
    await requireAdmin(invite.householdId);
    await db.delete(invites).where(eq(invites.id, id));
  });
}

// Replaces the `accept_invite` RPC. Anyone signed in may try a code; a removed
// member can rejoin while the link is still valid (an admin deletes the link
// to prevent that).
export async function acceptInvite(
  code: string,
): Promise<ActionResult<{ householdId: string; householdName: string }>> {
  return runAction(async () => {
    const user = await requireUser();
    const cleanCode = Code.parse(code);
    const [invite] = await db
      .select({
        id: invites.id,
        householdId: invites.householdId,
        role: invites.role,
        householdName: households.name,
      })
      .from(invites)
      .innerJoin(households, eq(households.id, invites.householdId))
      .where(and(eq(invites.code, cleanCode), gt(invites.expiresAt, sql`now()`)));
    // Same answer for unknown and expired codes: don't help anyone guess.
    if (!invite) throw new ActionError('invite_invalid');

    return db.transaction(async (tx) => {
      // The unique (household, user) constraint makes this safe against a
      // double submit; no row back means they were already in.
      const [joined] = await tx
        .insert(memberships)
        .values({ householdId: invite.householdId, userId: user.id, role: invite.role })
        .onConflictDoNothing()
        .returning({ id: memberships.id });
      if (!joined) throw new ActionError('already_member', { name: invite.householdName });

      await tx.insert(inviteRedemptions)
        .values({ inviteId: invite.id, userId: user.id })
        .onConflictDoNothing();
      // `accepted_by` keeps the first person who used the link.
      await tx.update(invites)
        .set({ acceptedBy: user.id, acceptedAt: new Date() })
        .where(and(eq(invites.id, invite.id), isNull(invites.acceptedBy)));
      return { householdId: invite.householdId, householdName: invite.householdName };
    });
  });
}
