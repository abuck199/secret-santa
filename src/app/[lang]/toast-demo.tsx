'use client';

// TEMPORARY (step 5a): removed with the style check page.

import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';

export default function ToastDemo() {
  const { t } = useI18n();
  return (
    <>
      <button className="btn-secondary" onClick={() => toast.success(t('wishlist.added'))}>Toast ✓</button>
      <button className="btn-secondary" onClick={() => toast.error(t('err.generic'))}>Toast ✗</button>
    </>
  );
}
