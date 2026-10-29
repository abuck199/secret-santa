import type { Metadata } from 'next';
import ErrorScreen from '@/components/ErrorScreen';
import { getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('err.notFoundTitle'), robots: { index: false } };
}

// Shown for notFound() in pages, in the visitor's language (unknown URLs get
// the global 404).
export default async function NotFound() {
  const t = await getT();
  return <ErrorScreen code="404" title={t('err.notFoundTitle')} text={t('err.notFoundText')} homeLabel={t('err.home')} />;
}
