'use client';

import { authClient } from '@/lib/auth-client';

// Ends the Better Auth session, then lands on the public home page with a full
// page load, not router navigation: Cache Components keeps recently visited
// routes mounted (hidden), so they'd still hold this user's data and form
// state for the next person on the same browser.
export function useSignOut() {
  return async () => {
    await authClient.signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose (see above)
    window.location.href = '/';
  };
}
