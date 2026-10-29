'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink, Gift, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { hostOf } from '@/lib/url';
import { cancelReservation, reserveItem } from '@/server/actions/reservations';
import type { HouseholdItem } from '@/server/queries/wishlist';

// Reserve / un-reserve state for a set of other people's items (members page
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

export default function GiftRow({
  item,
  busy,
  onToggle,
  className = 'p-3 rounded-xl bg-panel-2 border border-line',
}: {
  item: HouseholdItem;
  busy: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const reservedByOther = item.isReserved && !item.reservedByMe;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="min-w-0 flex-1">
        <p className={`font-medium break-words ${reservedByOther ? 'text-mute line-through' : 'text-fg'}`}>
          {item.item}
        </p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-mute hover:text-brand-ink transition mt-0.5"
          >
            <ExternalLink className="w-3 h-3" /> {hostOf(item.link)}
          </a>
        )}
      </div>

      {item.isMine ? null : item.reservedByMe ? (
        <button
          onClick={onToggle}
          disabled={busy}
          className="chip bg-brand-soft text-brand-ink border border-brand/30 hover:opacity-80 transition"
          title={t('members.reservedByYou')}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {t('members.reservedByYou')}
        </button>
      ) : reservedByOther ? (
        <span className="chip bg-panel text-mute border border-line">{t('members.reserved')}</span>
      ) : (
        <button onClick={onToggle} disabled={busy} className="btn-primary px-3 py-1.5 text-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
          {busy ? t('members.reserving') : t('members.reserve')}
        </button>
      )}
    </div>
  );
}
