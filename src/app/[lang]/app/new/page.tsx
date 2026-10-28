import type { Metadata } from 'next';
import Onboarding from '@/components/Onboarding';
import { getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.newHousehold') };
}

export default function NewHouseholdPage() {
  return <Onboarding embedded />;
}
