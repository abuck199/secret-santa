'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { cancelReservation, reserveItem } from '@/server/actions/reservations';
import type { HouseholdItem } from '@/server/queries/wishlist';

// Reserve / un-reserve state for a set of other people's items (member pages
// and the Secret Santa page).
export function useReservations(initial: HouseholdItem[]) {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const patch = (id: string, change: Partial<HouseholdItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...change } : it)));

  // Resolves to true when the change went through.
  async function toggle(item: HouseholdItem): Promise<boolean> {
    if (busy.has(item.id)) return false;
    setBusy((s) => new Set(s).add(item.id));
    const res = item.reservedByMe ? await cancelReservation(item.id) : await reserveItem(item.id);
    setBusy((s) => {
      const n = new Set(s);
      n.delete(item.id);
      return n;
    });
    if (res.ok) {
      if (item.reservedByMe) {
        patch(item.id, { isReserved: false, reservedByMe: false, purchasedByMe: false });
        toast.success(t('members.cancelToast'));
      } else {
        patch(item.id, { isReserved: true, reservedByMe: true });
        toast.success(t('members.reservedToast'));
      }
      return true;
    }
    toast.error(actionErrorMessage(t, res));
    // Someone beat us to it: show it as taken. Anything else: reload the truth.
    if (res.error === 'already_reserved') patch(item.id, { isReserved: true, reservedByMe: false });
    else router.refresh();
    return false;
  }

  return { items, busy, toggle };
}
