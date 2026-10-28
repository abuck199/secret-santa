import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Loading from '@/components/Loading';
import { getSessionUser } from '@/server/session';
import JoinInvite from './join-invite';

export const metadata: Metadata = { robots: { index: false } };

// /join/<code>: the link admins share. Signed in -> join right away; otherwise
// sign in first and come back here (the old app stashed the code instead).
export default function JoinPage({ params }: PageProps<'/[lang]/join/[code]'>) {
  return (
    <Suspense fallback={<Loading />}>
      <Join params={params} />
    </Suspense>
  );
}

async function Join({ params }: { params: PageProps<'/[lang]/join/[code]'>['params'] }) {
  const { code } = await params;
  if (!(await getSessionUser())) {
    redirect(`/login?next=${encodeURIComponent(`/join/${code}`)}`);
  }
  return <JoinInvite code={code} />;
}
