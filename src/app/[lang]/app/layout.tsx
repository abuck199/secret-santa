import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import NavBar from '@/components/NavBar';
import { getT } from '@/i18n/server';
import { getCurrentHousehold, getMyHouseholds } from '@/server/queries/households';
import { getMyProfile } from '@/server/queries/profile';

// The signed-in app is private (robots.txt says so too).
export const metadata: Metadata = { robots: { index: false } };

// Everything under /app reads the session, so it renders per request behind
// this boundary (Cache Components needs one around request-time reads).
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

// The old AppGuard, in order:
//   1. No name or birthday yet (first sign-in) -> /welcome.
//   2. No household yet -> /start (create or join).
//   3. Otherwise -> the app chrome around the page.
// The first two are their own routes (not swapped in here) so this layout
// always renders its page, which Next's navigation checks rely on.
async function AppShell({ children }: { children: ReactNode }) {
  const profile = await getMyProfile(); // redirects to /login without a session
  if (!profile.displayName || !profile.birthday) redirect('/welcome');
  const [households, current, t] = await Promise.all([getMyHouseholds(), getCurrentHousehold(), getT()]);
  if (!current) redirect('/start');

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-24 md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-fg focus:text-paper focus:shadow-card focus:text-sm focus:font-medium"
      >
        {t('a11y.skip')}
      </a>
      <NavBar name={profile.displayName} households={households} current={current} />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
