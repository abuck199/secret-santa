// Anonymity is the core product promise: nobody learns who reserved a gift,
// and nobody sees that their own gift is reserved.

import { beforeEach, describe, expect, it } from 'vitest';
import { cancelReservation, reserveItem, setPurchased } from '@/server/actions/reservations';
import { getHouseholdWishlists, getMyReservations } from '@/server/queries/wishlist';
import { resetDb } from './helpers/db';
import { fails, makeHousehold, makeItem, makeUser, ok } from './helpers/fixtures';
import { signInAs } from './helpers/session';

beforeEach(resetDb);

async function setup() {
  const alice = await makeUser('Alice');
  const bob = await makeUser('Bob');
  const carol = await makeUser('Carol');
  const hid = await makeHousehold(alice, [{ user: bob }, { user: carol }]);
  const gift = await makeItem(hid, alice, "Alice's gift");
  return { alice, bob, carol, hid, gift };
}

describe('anonymity', () => {
  it('never tells the owner their gift is reserved, and never says who reserved it', async () => {
    const { alice, bob, carol, hid, gift } = await setup();
    signInAs(bob);
    ok(await reserveItem(gift));
    ok(await setPurchased(gift, true));

    signInAs(alice);
    const asOwner = (await getHouseholdWishlists(hid)).find((i) => i.id === gift)!;
    expect(asOwner).toMatchObject({ isMine: true, isReserved: false, reservedByMe: false, purchasedByMe: false });

    signInAs(carol);
    const asOther = (await getHouseholdWishlists(hid)).find((i) => i.id === gift)!;
    expect(asOther).toMatchObject({ isMine: false, isReserved: true, reservedByMe: false, purchasedByMe: false });

    signInAs(bob);
    const asReserver = (await getHouseholdWishlists(hid)).find((i) => i.id === gift)!;
    expect(asReserver).toMatchObject({ isReserved: true, reservedByMe: true, purchasedByMe: true });
  });

  it('returns no raw reservation columns and no reserver id to anyone', async () => {
    const { alice, bob, carol, hid, gift } = await setup();
    signInAs(bob);
    ok(await reserveItem(gift));
    for (const viewer of [alice, carol, bob]) {
      signInAs(viewer);
      const payload = JSON.stringify(await getHouseholdWishlists(hid));
      expect(payload).not.toMatch(/reservedBy"|claimed|"purchased"/);
      // Bob's id may appear only as the owner of his own items (he has none).
      expect(payload).not.toContain(bob.id);
    }
  });

  it('lists only my own reservations', async () => {
    const { bob, carol, hid, gift } = await setup();
    const other = await makeItem(hid, bob, "Bob's gift");
    signInAs(bob);
    ok(await reserveItem(gift));
    signInAs(carol);
    ok(await reserveItem(other));
    expect((await getMyReservations(hid)).map((r) => r.id)).toEqual([other]);
  });
});

describe('reserving', () => {
  it("can't reserve your own item", async () => {
    const { alice, gift } = await setup();
    signInAs(alice);
    fails(await reserveItem(gift), 'own_item');
  });

  it('first one wins; the second gets already_reserved', async () => {
    const { bob, carol, gift } = await setup();
    signInAs(bob);
    ok(await reserveItem(gift));
    signInAs(carol);
    fails(await reserveItem(gift), 'already_reserved');
  });

  it('two reservations sent at once: exactly one succeeds', async () => {
    const { bob, carol, gift } = await setup();
    signInAs(bob);
    const first = reserveItem(gift);
    signInAs(carol);
    const second = reserveItem(gift);
    const results = await Promise.all([first, second]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it('outsiders are refused', async () => {
    const { gift } = await setup();
    signInAs(await makeUser('Mallory'));
    fails(await reserveItem(gift), 'forbidden');
  });

  it('only the reserver can cancel or mark purchased, and un-marking works', async () => {
    const { bob, carol, hid, gift } = await setup();
    signInAs(bob);
    ok(await reserveItem(gift));
    signInAs(carol);
    fails(await cancelReservation(gift), 'not_found');
    fails(await setPurchased(gift, true), 'not_found');

    signInAs(bob);
    ok(await setPurchased(gift, true));
    ok(await setPurchased(gift, false));
    expect((await getMyReservations(hid))[0]).toMatchObject({ id: gift, purchased: false });
    ok(await cancelReservation(gift));
    signInAs(carol);
    ok(await reserveItem(gift)); // back in the pool
  });

  it('rejects malformed ids cleanly', async () => {
    signInAs(await makeUser('Dave'));
    fails(await reserveItem('not-a-uuid'), 'invalid_input');
  });
});
