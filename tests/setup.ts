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

// Only the account actions touch Better Auth. Deletion codes: '123456' is
// right, '000000' has expired, anything else is wrong.
vi.mock('@/lib/auth', async () => {
  const { APIError } = await import('better-auth/api');
  return {
    auth: {
      api: {
        signOut: async () => {},
        sendVerificationOTP: async () => ({ success: true }),
        checkVerificationOTP: async ({ body }: { body: { otp: string } }) => {
          if (body.otp === '123456') return { success: true };
          throw new APIError('BAD_REQUEST', { code: body.otp === '000000' ? 'OTP_EXPIRED' : 'INVALID_OTP' });
        },
      },
    },
  };
});
