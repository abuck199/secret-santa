'use client';

import { useI18n } from '@/i18n/client';
import { WrappedGift } from './Celebration';

// A little present bobbing up and down while things load.
function BobbingGift({ size }: { size: string }) {
  return <WrappedGift className={`${size} animate-float`} />;
}

export default function Loading({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-paper grid place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-mute">
        <BobbingGift size="w-14 h-14" />
        <span className="text-[15px] font-semibold">{label || t('common.loading')}</span>
      </div>
    </div>
  );
}

export function InlineLoading({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`flex justify-center py-12 ${className}`} role="status">
      <BobbingGift size="w-12 h-12" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}
