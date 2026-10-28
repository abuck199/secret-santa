// Who is calling? The only place that reads the Better Auth session. Pages,
// Server Actions and route handlers all go through here, so authorization never
// depends on what the client sends.

import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// Deliberately narrow: this is what may travel to client components.
export type SessionUser = {
  id: string;
  email: string;
};

// `cache` dedupes the lookup within one request (a page and its components,
// or one Server Action), so calling it everywhere costs a single DB read.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, email: session.user.email };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}
