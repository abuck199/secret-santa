// Reads for Server Components. Not Server Actions: nothing here is reachable
// from the client except through what a page chooses to render.

import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { requireUser } from '../session';

export type MyProfile = {
  email: string;
  displayName: string;
  birthday: string | null; // 'YYYY-MM-DD'
};

export async function getMyProfile(): Promise<MyProfile> {
  const user = await requireUser();
  const [row] = await db
    .select({ displayName: profiles.displayName, birthday: profiles.birthday })
    .from(profiles)
    .where(eq(profiles.id, user.id));
  // The signup hook creates the row; fall back rather than crash if it lagged.
  return { email: user.email, displayName: row?.displayName ?? '', birthday: row?.birthday ?? null };
}
