import React from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function Loading({ label }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-paper grid place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-mute">
        <Loader2 className="w-7 h-7 animate-spin text-gold" aria-hidden="true" />
        <span className="text-sm">{label || t('common.loading')}</span>
      </div>
    </div>
  );
}

export function InlineLoading({ className = '' }) {
  const { t } = useI18n();
  return (
    <div className={`flex justify-center py-12 ${className}`} role="status">
      <Loader2 className="w-6 h-6 animate-spin text-gold" aria-hidden="true" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}
