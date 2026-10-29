import type { Metadata } from 'next';
import Onboarding from '@/components/Onboarding';
import { getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.joinGroup') };
}

// "Join with a code" in the group menu: same page as /app/new, join tab open.
export default function JoinGroupPage() {
  return <Onboarding embedded initialTab="join" />;
}
