import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import Faq from './faq';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.faq') };
}

export default function HelpPage() {
  return <Faq />;
}
