// Replaces `@/server/session`: tests pick who is calling with signInAs().

import type { SessionUser } from '@/server/session';

let current: SessionUser | null = null;

export function signInAs(user: SessionUser | null) {
  current = user;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return current;
}

export async function requireUser(): Promise<SessionUser> {
  if (!current) throw new Error('REDIRECT /login');
  return current;
}
