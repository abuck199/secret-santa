import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { wishlistItems } from '@/db/schema';
import { addItem, deleteItem, reorderItems, updateItem } from '@/server/actions/wishlist';
import { getMyItems } from '@/server/queries/wishlist';
import { db, resetDb } from './helpers/db';
import { fails, makeHousehold, makeItem, makeUser, ok } from './helpers/fixtures';
import { signInAs } from './helpers/session';

beforeEach(resetDb);

describe('my wishlist', () => {
  it('adds at the bottom with a normalized link; edits can clear the link', async () => {
    const alice = await makeUser('Alice');
    const hid = await makeHousehold(alice);
    signInAs(alice);
    const a = ok(await addItem(hid, { item: '  Book  ', link: 'example.com/book' }));
    const b = ok(await addItem(hid, { item: 'Mug' }));
    expect(a).toMatchObject({ item: 'Book', link: 'https://example.com/book', displayOrder: 0 });
    expect(b.displayOrder).toBe(1);

    const edited = ok(await updateItem(a.id, { item: 'Cookbook', link: '' }));
    expect(edited).toMatchObject({ item: 'Cookbook', link: null });
  });

  it('refuses unsafe or invalid links', async () => {
    const alice = await makeUser('Alice');
    const hid = await makeHousehold(alice);
    signInAs(alice);
    fails(await addItem(hid, { item: 'X', link: 'javascript:alert(1)' }), 'invalid_link');
    fails(await addItem(hid, { item: 'X', link: 'localhost' }), 'invalid_link');
    fails(await addItem(hid, { item: '   ' }), 'invalid_input');
  });

  it("only touches your own items", async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    const bobs = await makeItem(hid, bob, "Bob's");
    signInAs(alice);
    fails(await updateItem(bobs, { item: 'hacked' }), 'not_found');
    fails(await deleteItem(bobs), 'not_found');

    const mine = ok(await addItem(hid, { item: 'Mine' }));
    ok(await deleteItem(mine.id));
    expect(await getMyItems(hid)).toEqual([]);
  });

  it('caps at 50 items, even when adds race', async () => {
    const alice = await makeUser('Alice');
    const hid = await makeHousehold(alice);
    for (let i = 0; i < 48; i++) await makeItem(hid, alice, `filler ${i}`, { displayOrder: i });
    signInAs(alice);
    const results = await Promise.all([1, 2, 3].map((i) => addItem(hid, { item: `race ${i}` })));
    expect(results.filter((r) => r.ok)).toHaveLength(2);
    fails(results.find((r) => !r.ok)!, 'wishlist_full');
    const rows = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, alice.id));
    expect(rows).toHaveLength(50);
  });

  it('reorders only my items, ignoring repeats and foreign ids', async () => {
    const alice = await makeUser('Alice');
    const bob = await makeUser('Bob');
    const hid = await makeHousehold(alice, [{ user: bob }]);
    const [a, b, c] = [
      await makeItem(hid, alice, 'a', { displayOrder: 0 }),
      await makeItem(hid, alice, 'b', { displayOrder: 1 }),
      await makeItem(hid, alice, 'c', { displayOrder: 2 }),
    ];
    const bobs = await makeItem(hid, bob, "Bob's", { displayOrder: 7 });
    signInAs(alice);
    ok(await reorderItems(hid, [c, bobs, a, c, b]));
    expect((await getMyItems(hid)).map((i) => [i.item, i.displayOrder])).toEqual([
      ['c', 0],
      ['a', 1],
      ['b', 2],
    ]);
    const [bobRow] = await db.select().from(wishlistItems).where(eq(wishlistItems.id, bobs));
    expect(bobRow.displayOrder).toBe(7);
  });

  it('outsiders cannot add to a household', async () => {
    const alice = await makeUser('Alice');
    const hid = await makeHousehold(alice);
    signInAs(await makeUser('Mallory'));
    fails(await addItem(hid, { item: 'spam' }), 'forbidden');
  });
});
