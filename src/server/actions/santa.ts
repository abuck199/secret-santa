'use server';

// Secret Santa: exclusions, the draw, and announcing it. Every export here is
// a public POST endpoint.

import { and, eq, inArray } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/db';
import { assignments, households, memberships, santaExclusions, users } from '@/db/schema';
import { LANG_COOKIE, isLocale, localeFromAcceptLanguage } from '@/i18n/config';
import { sendSantaEmails, type EmailLang } from '@/lib/email';
import { requireAdmin } from '../authz';
import { allowSantaEmails } from '../otp-throttle';
import { ActionError, runAction, type ActionResult } from '../result';
import { drawCycle, pairKey } from '../santa-draw';

const MIN_MEMBERS = 3;
const Id = z.uuid();

// The link in the email comes from config, never from the request's Host
// header, which a caller could forge to send the family a look-alike site.
function siteUrl() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// The admin's language (toggle cookie, else browser): families mostly share one.
async function adminLang(): Promise<EmailLang> {
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return localeFromAcceptLanguage((await headers()).get('accept-language'));
}

// Admin only, Secret Santa must be on. One big loop of givers (nobody draws
// themselves) that keeps excluded pairs apart. A new draw is a draft: nobody
// sees it until the admin announces it, so a redo is always possible.
export async function shuffleAssignments(householdId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(householdId);
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

      const excluded = await tx
        .select({ a: santaExclusions.userA, b: santaExclusions.userB })
        .from(santaExclusions)
        .where(eq(santaExclusions.householdId, id));
      const pairs = drawCycle(members.map((m) => m.userId), new Set(excluded.map((e) => pairKey(e.a, e.b))));
      if (!pairs) throw new ActionError('santa_impossible');

      await tx.delete(assignments).where(eq(assignments.householdId, id));
      await tx.insert(assignments).values(pairs.map(([giverId, receiverId]) => ({ householdId: id, giverId, receiverId })));
      await tx.update(households).set({ santaAnnouncedAt: null }).where(eq(households.id, id));
    });
  });
}

// Makes the draft draw visible to everyone and emails each member a link (no
// names). Announcing twice sends nothing more. Over the daily email cap the
// draw is still announced, without emails, and the admin is told.
export async function announceDraw(householdId: string): Promise<ActionResult<{ emailed: boolean }>> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    await requireAdmin(id);
    const name = await db.transaction(async (tx) => {
      const [h] = await tx
        .select({ name: households.name, enabled: households.secretSantaEnabled, announcedAt: households.santaAnnouncedAt })
        .from(households)
        .where(eq(households.id, id))
        .for('update');
      if (!h?.enabled) throw new ActionError('santa_disabled');
      if (h.announcedAt) return null;
      const [drawn] = await tx
        .select({ id: assignments.id })
        .from(assignments)
        .where(eq(assignments.householdId, id))
        .limit(1);
      if (!drawn) throw new ActionError('santa_not_drawn');
      await tx.update(households).set({ santaAnnouncedAt: new Date() }).where(eq(households.id, id));
      return h.name;
    });
    if (name === null || !(await allowSantaEmails(id))) return { emailed: false };

    // Only the people in the draw (someone who joined since isn't in it).
    const rows = await db
      .selectDistinct({ email: users.email })
      .from(assignments)
      .innerJoin(users, eq(users.id, assignments.giverId))
      .where(eq(assignments.householdId, id));
    try {
      await sendSantaEmails(rows.map((r) => r.email), name, `${siteUrl()}/app/match`, await adminLang());
      return { emailed: true };
    } catch (err) {
      // The draw is announced either way; the page tells the admin to spread the word.
      console.error(err);
      return { emailed: false };
    }
  });
}

// "These two must not draw each other" (partners…). Both must be members.
export async function addExclusion(householdId: string, userA: string, userB: string): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const [a, b] = [Id.parse(userA), Id.parse(userB)].sort();
    if (a === b) throw new ActionError('invalid_input');
    await requireAdmin(id);
    const found = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(and(eq(memberships.householdId, id), inArray(memberships.userId, [a, b])));
    if (found.length !== 2) throw new ActionError('not_found');
    const [row] = await db
      .insert(santaExclusions)
      .values({ householdId: id, userA: a, userB: b })
      .onConflictDoNothing()
      .returning({ id: santaExclusions.id });
    if (row) return { id: row.id };
    const [existing] = await db
      .select({ id: santaExclusions.id })
      .from(santaExclusions)
      .where(and(eq(santaExclusions.householdId, id), eq(santaExclusions.userA, a), eq(santaExclusions.userB, b)));
    return { id: existing.id };
  });
}

export async function removeExclusion(householdId: string, exclusionId: string): Promise<ActionResult> {
  return runAction(async () => {
    const id = Id.parse(householdId);
    const exId = Id.parse(exclusionId);
    await requireAdmin(id);
    await db.delete(santaExclusions).where(and(eq(santaExclusions.id, exId), eq(santaExclusions.householdId, id)));
  });
}
