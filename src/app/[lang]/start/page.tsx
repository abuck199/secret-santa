import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Loading from '@/components/Loading';
import Onboarding from '@/components/Onboarding';
import { getT } from '@/i18n/server';
import { getMyHouseholds } from '@/server/queries/households';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('onboard.title'), robots: { index: false } };
}

// Create or join a first household (the /app layout sends people here while
// they belong to none). Later households are added from /app/new.
export default function StartPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Start />
    </Suspense>
  );
}

async function Start() {
  if ((await getMyHouseholds()).length > 0) redirect('/app');
  return <Onboarding />;
}
