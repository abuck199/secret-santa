'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/components/ErrorScreen';
import { useI18n } from '@/i18n/client';

// Unexpected errors while rendering a page. Server Actions don't land here:
// they return { ok: false } and show a toast.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen code="500" title={t('err.crashTitle')} text={t('err.crashText')} homeLabel={t('err.home')}>
      <button className="btn-primary" onClick={reset}>
        {t('err.retry')}
      </button>
    </ErrorScreen>
  );
}
