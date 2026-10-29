import { and, eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { assignments, memberships, wishlistItems } from '@/db/schema';
import {
  createHousehold,
  deleteHousehold,
  leaveHousehold,
  removeMember,
  renameHousehold,
  setMemberRole,
  setSecretSanta,
} from '@/server/actions/households';
import { getMembers, getMyHouseholds } from '@/server/queries/households';
import { db, resetDb } from './helpers/db';
import { fails, makeDraw, makeHousehold, makeItem, makeUser, ok } from './helpers/fixtures';
import { signInAs } from './helpers/session';

beforeEach(resetDb);

async function membershipId(hid: string, userId: string) {
  const [m] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.householdId, hid), eq(memberships.userId, userId)));
  return m.id;
}

describe('households', () => {
  it('creating makes you owner and admin', async () => {
    const alice = await makeUser('Alice');
    signInAs(alice);
    const { id } = ok(await createHousehold('Famille'));
    expect(await getMyHouseholds()).toEqual([
      { id, name: 'Famille', secretSantaEnabled: false, role: 'admin', isOwner: true },
    ]);
  });

  it('caps households owned per person at 2, even when creates race', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    await makeHousehold(alice, [], { name: 'First' });
    await makeHousehold(bob, [{ user: alice }]); // joining others doesn't count
    signInAs(alice);
    const results = await Promise.all(['A', 'B', 'C'].map((n) => createHousehold(n)));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.find((r) => !r.ok)).toMatchObject({ ok: false, error: 'household_cap', params: { max: '2' } });

    // Deleting one frees a slot.
    const owned = (await getMyHouseholds()).filter((h) => h.isOwner);
    expect(owned).toHaveLength(2);
    ok(await deleteHousehold(owned[0].id));
    ok(await createHousehold('Again'));
  });

  it('only admins rename or toggle Secret Santa', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    signInAs(bob);
    fails(await renameHousehold(hid, 'Hacked'), 'forbidden');
    fails(await setSecretSanta(hid, true), 'forbidden');
    signInAs(alice);
    ok(await renameHousehold(hid, 'Renamed'));
    fails(await renameHousehold(hid, '   '), 'invalid_input');
  });

  it('only the owner deletes; the owner cannot leave', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob, role: 'admin' }]);
    signInAs(bob);
    fails(await deleteHousehold(hid), 'forbidden');
    signInAs(alice);
    fails(await leaveHousehold(hid), 'owner_cannot_leave');
    ok(await deleteHousehold(hid));
    expect(await getMyHouseholds()).toEqual([]);
  });

  it("can't leave during a running draw you're in, until Secret Santa is off", async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const carol = await makeUser('Carol');
    const hid = await makeHousehold(alice, [{ user: bob }, { user: carol }], { santa: true });
    await makeDraw(hid, [[alice, bob], [bob, carol], [carol, alice]]);
    signInAs(bob);
    fails(await leaveHousehold(hid), 'in_active_draw');
    signInAs(alice);
    ok(await setSecretSanta(hid, false));
    signInAs(bob);
    ok(await leaveHousehold(hid));
    const left = await db.select().from(assignments).where(eq(assignments.householdId, hid));
    expect(left.every((a) => a.giverId !== bob.id && a.receiverId !== bob.id)).toBe(true);
  });

  it('leaving: my list goes, bought gifts stay taken, unbought ones are released', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    await makeItem(hid, bob, "Bob's own");
    const bought = await makeItem(hid, alice, 'bought', { claimed: true, reservedBy: bob.id, purchased: true });
    const held = await makeItem(hid, alice, 'held', { claimed: true, reservedBy: bob.id, purchased: false });
    signInAs(bob);
    ok(await leaveHousehold(hid));

    const rows = await db.select().from(wishlistItems).where(eq(wishlistItems.householdId, hid));
    expect(rows.map((r) => r.item).sort()).toEqual(['bought', 'held']);
    expect(rows.find((r) => r.id === bought)).toMatchObject({ claimed: true, purchased: true, reservedBy: null });
    expect(rows.find((r) => r.id === held)).toMatchObject({ claimed: false, purchased: false, reservedBy: null });
  });
});

describe('members', () => {
  it('admins promote and demote, but never themselves or the owner', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const carol = await makeUser('Carol');
    const hid = await makeHousehold(alice, [{ user: bob }, { user: carol }]);
    signInAs(bob);
    fails(await setMemberRole(await membershipId(hid, carol.id), 'admin'), 'forbidden');

    signInAs(alice);
    ok(await setMemberRole(await membershipId(hid, bob.id), 'admin'));
    signInAs(bob);
    fails(await setMemberRole(await membershipId(hid, alice.id), 'member'), 'cannot_change_owner');
    fails(await removeMember(await membershipId(hid, alice.id)), 'cannot_change_owner');
    fails(await setMemberRole(await membershipId(hid, bob.id), 'member'), 'cannot_change_self');

    signInAs(alice);
    ok(await setMemberRole(await membershipId(hid, bob.id), 'member')); // demote
    const roles = Object.fromEntries((await getMembers(hid)).map((m) => [m.displayName, m.role]));
    expect(roles).toEqual({ Alice: 'admin', Bob: 'member', Carol: 'member' });
  });

  it('an admin can remove someone even during a running draw', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const carol = await makeUser('Carol');
    const hid = await makeHousehold(alice, [{ user: bob }, { user: carol }], { santa: true });
    await makeDraw(hid, [[alice, bob], [bob, carol], [carol, alice]]);
    signInAs(alice);
    ok(await removeMember(await membershipId(hid, bob.id)));
    expect((await getMembers(hid)).map((m) => m.displayName)).toEqual(['Alice', 'Carol']);
  });

  it('outsiders cannot read a household', async () => {
    const alice = await makeUser('Alice');
    const hid = await makeHousehold(alice);
    signInAs(await makeUser('Mallory'));
    await expect(getMembers(hid)).rejects.toThrow('forbidden');
  });
});
