import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CompleteProfile from '@/components/CompleteProfile';
import Loading from '@/components/Loading';
import { getT } from '@/i18n/server';
import { getMyProfile } from '@/server/queries/profile';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('complete.title'), robots: { index: false } };
}

// First stop after a first sign-in: name and birthday (the /app layout sends
// people here until both are set).
export default function WelcomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Welcome />
    </Suspense>
  );
}

async function Welcome() {
  const profile = await getMyProfile();
  if (profile.displayName && profile.birthday) redirect('/app');
  return <CompleteProfile initialName={profile.displayName} initialBirthday={profile.birthday} />;
}
