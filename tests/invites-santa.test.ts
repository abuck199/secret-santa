import { and, eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assignments, memberships, santaExclusions } from '@/db/schema';
import { sendSantaEmails } from '@/lib/email';
import { acceptInvite, createInvite, deleteInvite } from '@/server/actions/invites';
import { removeMember, setSecretSanta } from '@/server/actions/households';
import { addExclusion, announceDraw, removeExclusion, shuffleAssignments } from '@/server/actions/santa';
import { SANTA_ANNOUNCEMENTS_PER_DAY } from '@/server/otp-throttle';
import { getMembers } from '@/server/queries/households';
import { getInvites } from '@/server/queries/invites';
import { getMyAssignment, getSantaAdmin } from '@/server/queries/santa';
import { pairKey } from '@/server/santa-draw';
import { db, resetDb } from './helpers/db';
import { fails, makeHousehold, makeInvite, makeUser, ok } from './helpers/fixtures';
import { signInAs } from './helpers/session';

// The announcement email, without Resend.
vi.mock('@/lib/email', () => ({ sendSantaEmails: vi.fn(async () => {}) }));

beforeEach(async () => {
  await resetDb();
  vi.mocked(sendSantaEmails).mockClear();
});

describe('invites', () => {
  it('admins create up to 5 active links; expired ones free a slot', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    signInAs(bob);
    fails(await createInvite(hid), 'forbidden');

    signInAs(alice);
    await makeInvite(hid, alice, { expired: true });
    const created = await Promise.all([1, 2, 3, 4, 5, 6].map(() => createInvite(hid)));
    expect(created.filter((r) => r.ok)).toHaveLength(5);
    expect(created.find((r) => !r.ok)).toMatchObject({ ok: false, error: 'invite_cap', params: { max: '5' } });
    const first = ok(created[0]);
    expect(first.code).toMatch(/^[0-9a-f]{16}$/);

    ok(await deleteInvite(first.id));
    ok(await createInvite(hid));
  });

  it('links are multi-use; expired and unknown codes look the same', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const carol = await makeUser('Carol');
    const hid = await makeHousehold(alice, [], { name: 'Famille Noël' });
    const code = await makeInvite(hid, alice);
    const old = await makeInvite(hid, alice, { expired: true });

    signInAs(bob);
    expect(ok(await acceptInvite(`  ${code}  `))).toMatchObject({ householdId: hid, householdName: 'Famille Noël' });
    expect(await acceptInvite(code)).toMatchObject({ ok: false, error: 'already_member', params: { name: 'Famille Noël' } });
    signInAs(carol);
    ok(await acceptInvite(code));
    fails(await acceptInvite(old), 'invite_invalid');
    fails(await acceptInvite('0000000000000000'), 'invite_invalid');

    signInAs(alice);
    const [invite] = (await getInvites(hid)).filter((i) => i.code === code);
    expect(invite.joiners.map((j) => j.name).sort()).toEqual(['Bob', 'Carol']);
    expect(invite.createdByMe).toBe(true);
  });

  it('members never see invite codes', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    signInAs(bob);
    await expect(getInvites(hid)).rejects.toThrow('forbidden');
  });
});

describe('Secret Santa', () => {
  it('needs Secret Santa on, an admin, and 3 members', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    signInAs(alice);
    fails(await shuffleAssignments(hid), 'santa_disabled');
    ok(await setSecretSanta(hid, true));
    expect(await shuffleAssignments(hid)).toMatchObject({ ok: false, error: 'santa_min_members', params: { min: '3' } });
    signInAs(bob);
    fails(await shuffleAssignments(hid), 'forbidden');
  });

  it('every draw is a permutation where nobody gets themselves', async () => {
    const people = await Promise.all(['A', 'B', 'C', 'D', 'E'].map(makeUser));
    const hid = await makeHousehold(people[0], people.slice(1).map((user) => ({ user })), { santa: true });
    signInAs(people[0]);
    for (let i = 0; i < 30; i++) {
      ok(await shuffleAssignments(hid));
      const draw = await db.select().from(assignments).where(eq(assignments.householdId, hid));
      expect(draw).toHaveLength(5);
      expect(new Set(draw.map((d) => d.giverId)).size).toBe(5);
      expect(new Set(draw.map((d) => d.receiverId)).size).toBe(5);
      expect(draw.some((d) => d.giverId === d.receiverId)).toBe(false);
    }
  });

  it('you only ever see your own pairing, and nothing once it is off', async () => {
    const [a, b, c] = await Promise.all(['A', 'B', 'C'].map(makeUser));
    const hid = await makeHousehold(a, [{ user: b }, { user: c }], { santa: true });
    signInAs(a);
    ok(await shuffleAssignments(hid));
    ok(await announceDraw(hid));
    const mine = await getMyAssignment(hid);
    expect(mine && [b.id, c.id]).toContain(mine!.receiverId);
    expect(Object.keys(mine!)).toEqual(['receiverId', 'receiverName']);
    ok(await setSecretSanta(hid, false));
    expect(await getMyAssignment(hid)).toBeNull();
    expect((await getMembers(hid)).length).toBe(3);
  });

  it('never pairs excluded people, in either direction', async () => {
    const people = await Promise.all(['A', 'B', 'C', 'D', 'E', 'F'].map(makeUser));
    const [a, b, c, d, e, f] = people;
    const hid = await makeHousehold(a, people.slice(1).map((user) => ({ user })), { santa: true });
    signInAs(a);
    for (const [x, y] of [[a, b], [c, d], [e, f], [a, c]]) ok(await addExclusion(hid, x.id, y.id));
    const banned = new Set([pairKey(a.id, b.id), pairKey(c.id, d.id), pairKey(e.id, f.id), pairKey(a.id, c.id)]);
    for (let i = 0; i < 30; i++) {
      ok(await shuffleAssignments(hid));
      const draw = await db.select().from(assignments).where(eq(assignments.householdId, hid));
      expect(draw).toHaveLength(6);
      expect(new Set(draw.map((x) => x.receiverId)).size).toBe(6);
      expect(draw.some((x) => banned.has(pairKey(x.giverId, x.receiverId)))).toBe(false);
    }
  });

  it('says so when the exclusions leave no possible draw, and keeps the old one', async () => {
    const [a, b, c] = await Promise.all(['A', 'B', 'C'].map(makeUser));
    const hid = await makeHousehold(a, [{ user: b }, { user: c }], { santa: true });
    signInAs(a);
    ok(await shuffleAssignments(hid));
    const before = await db.select().from(assignments).where(eq(assignments.householdId, hid));
    // With 3 people every pair sits next to each other in the loop.
    ok(await addExclusion(hid, b.id, c.id));
    fails(await shuffleAssignments(hid), 'santa_impossible');
    expect(await db.select().from(assignments).where(eq(assignments.householdId, hid))).toEqual(before);
  });

  it('a draw stays hidden until announced, and a redraw hides it again', async () => {
    const [a, b, c] = await Promise.all(['A', 'B', 'C'].map(makeUser));
    const hid = await makeHousehold(a, [{ user: b }, { user: c }], { santa: true });
    signInAs(a);
    fails(await announceDraw(hid), 'santa_not_drawn');
    ok(await shuffleAssignments(hid));
    expect(await getSantaAdmin(hid)).toMatchObject({ drawn: true, announced: false });
    for (const u of [a, b, c]) {
      signInAs(u);
      expect(await getMyAssignment(hid)).toBeNull();
    }

    signInAs(b);
    fails(await announceDraw(hid), 'forbidden');
    signInAs(a);
    expect(ok(await announceDraw(hid))).toEqual({ emailed: true });
    expect(sendSantaEmails).toHaveBeenCalledTimes(1);
    const [to, household, link] = vi.mocked(sendSantaEmails).mock.calls[0];
    expect([...to].sort()).toEqual([a.email, b.email, c.email].sort());
    expect(household).toBe('Famille Test');
    expect(link).toMatch(/\/app\/match$/);
    for (const u of [a, b, c]) {
      signInAs(u);
      expect(await getMyAssignment(hid)).not.toBeNull();
    }

    // Announcing again sends nothing more.
    signInAs(a);
    expect(ok(await announceDraw(hid))).toEqual({ emailed: false });
    expect(sendSantaEmails).toHaveBeenCalledTimes(1);

    ok(await shuffleAssignments(hid));
    expect(await getSantaAdmin(hid)).toMatchObject({ drawn: true, announced: false });
    signInAs(b);
    expect(await getMyAssignment(hid)).toBeNull();
  });

  it(`emails a household at most ${SANTA_ANNOUNCEMENTS_PER_DAY} times a day, but still announces`, async () => {
    const [a, b, c] = await Promise.all(['A', 'B', 'C'].map(makeUser));
    const hid = await makeHousehold(a, [{ user: b }, { user: c }], { santa: true });
    signInAs(a);
    for (let i = 0; i < SANTA_ANNOUNCEMENTS_PER_DAY; i++) {
      ok(await shuffleAssignments(hid));
      expect(ok(await announceDraw(hid))).toEqual({ emailed: true });
    }
    ok(await shuffleAssignments(hid));
    expect(ok(await announceDraw(hid))).toEqual({ emailed: false });
    expect(sendSantaEmails).toHaveBeenCalledTimes(SANTA_ANNOUNCEMENTS_PER_DAY);
    expect(await getSantaAdmin(hid)).toMatchObject({ announced: true });
  });

  it('exclusions: admins only, between two different members, gone with a removed member', async () => {
    const [a, b, c, outsider] = await Promise.all(['A', 'B', 'C', 'Out'].map(makeUser));
    const hid = await makeHousehold(a, [{ user: b }, { user: c }], { santa: true });
    signInAs(b);
    fails(await addExclusion(hid, a.id, c.id), 'forbidden');
    await expect(getSantaAdmin(hid)).rejects.toThrow();

    signInAs(a);
    fails(await addExclusion(hid, b.id, b.id), 'invalid_input');
    fails(await addExclusion(hid, b.id, outsider.id), 'not_found');
    const { id } = ok(await addExclusion(hid, c.id, b.id));
    // Same pair the other way round: no duplicate.
    expect(ok(await addExclusion(hid, b.id, c.id))).toEqual({ id });
    const { exclusions } = await getSantaAdmin(hid);
    expect(exclusions).toHaveLength(1);
    expect([exclusions[0].a.name, exclusions[0].b.name].sort()).toEqual(['B', 'C']);

    // Another household's admin can't remove it.
    const hid2 = await makeHousehold(outsider);
    signInAs(outsider);
    ok(await removeExclusion(hid2, id));
    signInAs(a);
    expect((await getSantaAdmin(hid)).exclusions).toHaveLength(1);

    ok(await addExclusion(hid, a.id, b.id));
    const [mb] = await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.householdId, hid), eq(memberships.userId, b.id)));
    ok(await removeMember(mb.id));
    expect(await db.select().from(santaExclusions).where(eq(santaExclusions.householdId, hid))).toHaveLength(0);

    ok(await addExclusion(hid, a.id, c.id));
    const left = await getSantaAdmin(hid);
    ok(await removeExclusion(hid, left.exclusions[0].id));
    expect((await getSantaAdmin(hid)).exclusions).toHaveLength(0);
  });
});
