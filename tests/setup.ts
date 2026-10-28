// Swap the outside world for test doubles; everything in src/server runs for
// real on top of them.

import { vi } from 'vitest';

vi.mock('@/db', () => import('./helpers/db'));
vi.mock('@/server/session', () => import('./helpers/session'));

// Request-scoped Next.js APIs have no request in tests.
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, set: () => {} }),
  headers: async () => new Headers(),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
  unstable_rethrow: () => {},
}));

// Only deleteAccount touches Better Auth (to sign out first).
vi.mock('@/lib/auth', () => ({ auth: { api: { signOut: async () => {} } } }));
