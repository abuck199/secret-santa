import { and, eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { assignments, households, memberships, profiles, users, wishlistItems } from '@/db/schema';
import { deleteAccount, requestDeletionCode } from '@/server/actions/account';
import { allowOtpEmail, OTP_EMAILS_PER_HOUR } from '@/server/otp-throttle';
import { db, resetDb } from './helpers/db';
import { fails, makeDraw, makeHousehold, makeItem, makeUser, ok } from './helpers/fixtures';
import { signInAs } from './helpers/session';

beforeEach(resetDb);

describe('deleteAccount', () => {
  it('needs the emailed code: wrong, expired or malformed codes delete nothing', async () => {
    const x = await makeUser('X');
    await makeHousehold(x);
    signInAs(x);
    ok(await requestDeletionCode());
    fails(await deleteAccount('654321'), 'invalid_code');
    fails(await deleteAccount('000000'), 'code_expired');
    fails(await deleteAccount('abc'), 'invalid_input');
    expect(await db.select().from(users).where(eq(users.id, x.id))).toHaveLength(1);
    expect(await db.select().from(households).where(eq(households.ownerId, x.id))).toHaveLength(1);
  });

  it('hands owned households over, deletes empty ones, and cleans up everywhere', async () => {
    const x = await makeUser('X');
    const olderMember = await makeUser('Older');
    const admin = await makeUser('Admin');
    const owner3 = await makeUser('Owner3');
    // H1: an admin is preferred over a longer-standing plain member.
    const h1 = await makeHousehold(x, [
      { user: olderMember, daysAgo: 30 },
      { user: admin, role: 'admin', daysAgo: 1 },
    ]);
    // H2: X is alone.
    const h2 = await makeHousehold(x);
    // H3: X is a member with reservations and a running draw.
    const h3 = await makeHousehold(owner3, [{ user: x }, { user: admin }], { santa: true });
    await makeDraw(h3, [[x, owner3], [owner3, admin], [admin, x]]);
    const bought = await makeItem(h3, owner3, 'bought', { claimed: true, reservedBy: x.id, purchased: true });
    const held = await makeItem(h3, owner3, 'held', { claimed: true, reservedBy: x.id, purchased: false });

    signInAs(x);
    ok(await deleteAccount('123456'));

    const [h1Row] = await db.select().from(households).where(eq(households.id, h1));
    expect(h1Row.ownerId).toBe(admin.id);
    expect(await db.select().from(households).where(eq(households.id, h2))).toEqual([]);

    const [heir] = await db
      .select({ role: memberships.role })
      .from(memberships)
      .where(and(eq(memberships.householdId, h1), eq(memberships.userId, admin.id)));
    expect(heir.role).toBe('admin');

    const items = await db.select().from(wishlistItems).where(eq(wishlistItems.householdId, h3));
    expect(items.find((i) => i.id === bought)).toMatchObject({ claimed: true, purchased: true, reservedBy: null });
    expect(items.find((i) => i.id === held)).toMatchObject({ claimed: false, reservedBy: null });
    // Only pairings involving X are voided (an admin re-draws).
    const draw = await db.select().from(assignments).where(eq(assignments.householdId, h3));
    expect(draw.map((d) => [d.giverId, d.receiverId])).toEqual([[owner3.id, admin.id]]);

    expect(await db.select().from(users).where(eq(users.id, x.id))).toEqual([]);
    expect(await db.select().from(profiles).where(eq(profiles.id, x.id))).toEqual([]);
  });
});

describe('OTP email throttle', () => {
  it(`allows ${OTP_EMAILS_PER_HOUR} codes per address per hour`, async () => {
    const t0 = Date.now();
    const results = [];
    for (let i = 0; i < OTP_EMAILS_PER_HOUR + 1; i++) results.push(await allowOtpEmail('Someone@Example.com', t0 + i));
    expect(results).toEqual([...Array(OTP_EMAILS_PER_HOUR).fill(true), false]);
    // Case-insensitive, and other addresses are unaffected.
    expect(await allowOtpEmail('someone@example.com', t0 + 10)).toBe(false);
    expect(await allowOtpEmail('other@example.com', t0 + 10)).toBe(true);
    // A new window starts after an hour.
    expect(await allowOtpEmail('someone@example.com', t0 + 60 * 60 * 1000 + 1)).toBe(true);
  });
});
