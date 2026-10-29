'use server';

// Account deletion (Law 25: the privacy policy promises it), confirmed with a
// one-time code sent by email, so a session left open on a shared computer
// isn't enough to delete someone's account. Every export here is a public
// POST endpoint.

import { APIError } from 'better-auth/api';
import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/db';
import { households, memberships, users, verifications } from '@/db/schema';
import { auth } from '@/lib/auth';
import { DELETION_OTP_TYPE } from '@/lib/email';
import { removeFromHousehold } from '../memberships';
import { ActionError, runAction, type ActionResult } from '../result';
import { requireUser } from '../session';

const Code = z.string().trim().regex(/^\d{6}$/);

// Step 1: email a confirmation code to the signed-in user.
export async function requestDeletionCode(): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    await auth.api.sendVerificationOTP({
      body: { email: user.email, type: DELETION_OTP_TYPE },
      headers: await headers(), // language cookie for the email
    });
  });
}

// Step 2: with the right code, delete. Households the user owns go to another
// member (an admin first, then the longest-standing member), who becomes owner
// and admin; a household with nobody else in it is deleted. Then the user
// leaves every household the usual way (unbought reservations released,
// bought ones stay taken, draw pairings voided) and the user row goes,
// cascading to profile, sessions and list. Unlike leaving, this overrides a
// running Secret Santa draw on purpose.
export async function deleteAccount(code: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const otp = Code.parse(code);
    try {
      // Checks expiry and counts attempts (3 max, then the code is dropped).
      await auth.api.checkVerificationOTP({ body: { email: user.email, type: DELETION_OTP_TYPE, otp } });
    } catch (err) {
      if (!(err instanceof APIError)) throw err;
      const reason = (err.body as { code?: string } | undefined)?.code;
      if (reason === 'OTP_EXPIRED') throw new ActionError('code_expired');
      if (reason === 'TOO_MANY_ATTEMPTS') throw new ActionError('too_many_attempts');
      throw new ActionError('invalid_code');
    }

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

      // The used code (not tied to the user row by a foreign key).
      await tx.delete(verifications)
        .where(eq(verifications.identifier, `${DELETION_OTP_TYPE}-otp-${user.email}`));
      await tx.delete(users).where(eq(users.id, user.id));
    });
  });
}
