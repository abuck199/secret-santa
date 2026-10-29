'use client';

import { Gift, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import ProductImage from './ProductImage';

// What a pasted shop link gave us: a spinner while looking, then the photo and
// title (with a way to drop the photo, or to use the shop's product name).
export default function LinkPreviewCard({
  status,
  title,
  imageUrl,
  site,
  canUseTitle,
  onUseTitle,
  onRemovePhoto,
}: {
  status: 'idle' | 'loading' | 'done';
  title: string | null;
  imageUrl: string | null;
  site: string;
  canUseTitle: boolean;
  onUseTitle: () => void;
  onRemovePhoto: () => void;
}) {
  const { t } = useI18n();

  if (status === 'loading') {
    return (
      <p className="flex items-center gap-2 mt-3 text-[15px] text-mute" role="status">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> {t('wishlist.previewLoading')}
      </p>
    );
  }
  if (status !== 'done') return null;
  if (!title && !imageUrl) {
    return (
      <p className="mt-3 text-[15px] text-mute" role="status">
        {t('wishlist.previewNone')}
      </p>
    );
  }
  return (
    <div className="flex items-center gap-3 mt-3 p-2.5 rounded-2xl bg-paper animate-pop" role="status">
      {imageUrl && (
        <span className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white grid place-items-center text-brand-ink">
          <ProductImage src={imageUrl} fallback={<Gift className="w-6 h-6" aria-hidden="true" />} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title && <p className="text-[15px] font-semibold text-fg line-clamp-2">{title}</p>}
        <p className="text-sm text-mute">{t('wishlist.previewFound', { site })}</p>
        <div className="flex flex-wrap gap-x-3">
          {canUseTitle && (
            <button type="button" onClick={onUseTitle} className="min-h-9 text-sm font-semibold text-brand-ink hover:underline">
              {t('wishlist.useTitle')}
            </button>
          )}
          {imageUrl && (
            <button type="button" onClick={onRemovePhoto} className="min-h-9 text-sm font-semibold text-mute hover:text-fg">
              {t('wishlist.removePhoto')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
