import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { assignments } from '@/db/schema';
import { acceptInvite, createInvite, deleteInvite } from '@/server/actions/invites';
import { setSecretSanta } from '@/server/actions/households';
import { shuffleAssignments } from '@/server/actions/santa';
import { getMembers } from '@/server/queries/households';
import { getInvites } from '@/server/queries/invites';
import { getMyAssignment } from '@/server/queries/santa';
import { db, resetDb } from './helpers/db';
import { fails, makeHousehold, makeInvite, makeUser, ok } from './helpers/fixtures';
import { signInAs } from './helpers/session';

beforeEach(resetDb);

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
    const mine = await getMyAssignment(hid);
    expect(mine && [b.id, c.id]).toContain(mine!.receiverId);
    expect(Object.keys(mine!)).toEqual(['receiverId', 'receiverName']);
    ok(await setSecretSanta(hid, false));
    expect(await getMyAssignment(hid)).toBeNull();
    expect((await getMembers(hid)).length).toBe(3);
  });
});
