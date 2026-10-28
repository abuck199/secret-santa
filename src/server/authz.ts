// Household authorization. Replaces Supabase RLS + the is_member/is_admin RPCs:
// with a single DB role, these checks are the only thing standing between a
// user and another household's data, so every action calls one of them first.

import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { memberships } from '@/db/schema';
import { ActionError } from './result';
import { requireUser, type SessionUser } from './session';

// Ids arrive from the client; a malformed one would make Postgres throw a
// 500 instead of a clean "no access".
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export async function isMember(householdId: string, userId: string): Promise<boolean> {
  if (!isUuid(householdId) || !isUuid(userId)) return false;
  const [row] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.householdId, householdId), eq(memberships.userId, userId)))
    .limit(1);
  return !!row;
}

export async function isAdmin(householdId: string, userId: string): Promise<boolean> {
  if (!isUuid(householdId) || !isUuid(userId)) return false;
  const [row] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(
      eq(memberships.householdId, householdId),
      eq(memberships.userId, userId),
      eq(memberships.role, 'admin'),
    ))
    .limit(1);
  return !!row;
}

// Session + membership in one call, for the top of every household action.
export async function requireMember(householdId: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!(await isMember(householdId, user.id))) throw new ActionError('forbidden');
  return user;
}

export async function requireAdmin(householdId: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!(await isAdmin(householdId, user.id))) throw new ActionError('forbidden');
  return user;
}
