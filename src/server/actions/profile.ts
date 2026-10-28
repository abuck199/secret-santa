'use server';

// Every export here is a public POST endpoint: validate input, derive the
// user from the session, never trust ids for ownership.

import { z } from 'zod';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { runAction, type ActionResult } from '../result';
import { requireUser } from '../session';

const ProfileInput = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  // Empty string clears the birthday, like the old app.
  birthday: z.union([z.iso.date(), z.literal('')]).optional(),
});

export async function updateProfile(
  input: z.input<typeof ProfileInput>,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const { displayName, birthday } = ProfileInput.parse(input);
    const patch: Partial<typeof profiles.$inferInsert> = {};
    if (displayName !== undefined) patch.displayName = displayName;
    if (birthday !== undefined) patch.birthday = birthday || null;
    if (Object.keys(patch).length === 0) return;
    await db
      .insert(profiles)
      .values({ id: user.id, ...patch })
      .onConflictDoUpdate({ target: profiles.id, set: patch });
  });
}
