// Small builders for test data, written straight to the test DB.

import { eq } from 'drizzle-orm';
import { expect } from 'vitest';
import type { ActionResult } from '@/server/result';
import type { SessionUser } from '@/server/session';
import {
  assignments,
  households,
  invites,
  memberships,
  profiles,
  users,
  wishlistItems,
} from '@/db/schema';
import { db } from './db';

let n = 0;

export async function makeUser(name: string): Promise<SessionUser> {
  const email = `${name.toLowerCase()}-${++n}@example.com`;
  const [u] = await db.insert(users).values({ email, name }).returning({ id: users.id, email: users.email });
  await db.insert(profiles).values({ id: u.id, displayName: name, birthday: '1990-01-01' });
  return u;
}

export async function makeHousehold(
  owner: SessionUser,
  others: { user: SessionUser; role?: 'admin' | 'member'; daysAgo?: number }[] = [],
  opts: { name?: string; santa?: boolean } = {},
) {
  const [h] = await db
    .insert(households)
    .values({ name: opts.name ?? 'Famille Test', ownerId: owner.id, secretSantaEnabled: opts.santa ?? false })
    .returning({ id: households.id });
  await db.insert(memberships).values({ householdId: h.id, userId: owner.id, role: 'admin' });
  for (const o of others) {
    await db.insert(memberships).values({
      householdId: h.id,
      userId: o.user.id,
      role: o.role ?? 'member',
      joinedAt: new Date(Date.now() - (o.daysAgo ?? 0) * 86_400_000),
    });
  }
  return h.id;
}

export async function makeItem(
  householdId: string,
  owner: SessionUser,
  item: string,
  extra: Partial<typeof wishlistItems.$inferInsert> = {},
) {
  const [row] = await db
    .insert(wishlistItems)
    .values({ householdId, userId: owner.id, item, ...extra })
    .returning({ id: wishlistItems.id });
  return row.id;
}

export async function makeInvite(householdId: string, by: SessionUser, opts: { code?: string; expired?: boolean } = {}) {
  const code = opts.code ?? `code${++n}`.padEnd(16, '0');
  await db.insert(invites).values({
    householdId,
    code,
    invitedBy: by.id,
    expiresAt: new Date(Date.now() + (opts.expired ? -60_000 : 30 * 86_400_000)),
  });
  return code;
}

// An announced draw (what members can see), unless `announced: false`.
export async function makeDraw(householdId: string, pairs: [SessionUser, SessionUser][], opts: { announced?: boolean } = {}) {
  for (const [giver, receiver] of pairs) {
    await db.insert(assignments).values({ householdId, giverId: giver.id, receiverId: receiver.id });
  }
  await db
    .update(households)
    .set({ santaAnnouncedAt: opts.announced === false ? null : new Date() })
    .where(eq(households.id, householdId));
}

// Unwrap an ActionResult in tests: assert it succeeded, or failed with `code`.
export function ok<T>(res: ActionResult<T>): T {
  expect(res).toMatchObject({ ok: true });
  return (res as { ok: true; data: T }).data;
}

export function fails(res: ActionResult<unknown>, code: string) {
  expect(res).toMatchObject({ ok: false, error: code });
}
