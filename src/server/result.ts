// How Server Actions report back to the UI: never throw across the wire, return
// `{ ok, data }` or `{ ok: false, error }` where `error` is a short code the UI
// translates (`err.<code>`) into a toast.

import 'server-only';
import { unstable_rethrow } from 'next/navigation';
import { ZodError } from 'zod';

export type ErrorCode =
  | 'generic'
  | 'invalid_input'
  | 'forbidden'
  | 'not_found'
  | 'owner_cannot_leave'
  | 'in_active_draw'
  | 'cannot_change_owner'
  | 'cannot_change_self'
  | 'invite_invalid'
  | 'invite_cap'
  | 'already_member'
  | 'wishlist_full'
  | 'invalid_link'
  | 'own_item'
  | 'already_reserved'
  | 'santa_disabled'
  | 'santa_min_members';

// `params` fill placeholders in the translated message, e.g. {name}.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorCode; params?: Record<string, string> };

// Thrown anywhere under an action (including the authz helpers) to end it with
// a specific code.
export class ActionError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly params?: Record<string, string>,
  ) {
    super(code);
    this.name = 'ActionError';
  }
}

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    unstable_rethrow(err); // let redirect('/login') and friends through
    if (err instanceof ActionError) return { ok: false, error: err.code, params: err.params };
    if (err instanceof ZodError) return { ok: false, error: 'invalid_input' };
    console.error(err);
    return { ok: false, error: 'generic' };
  }
}
