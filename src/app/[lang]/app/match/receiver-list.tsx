'use client';

import GiftRow, { useReservations } from '@/components/GiftRow';
import { useI18n } from '@/i18n/client';
import type { HouseholdItem } from '@/server/queries/wishlist';

// The Secret Santa receiver's list, reservable like on the members page.
export default function ReceiverList({ initialItems }: { initialItems: HouseholdItem[] }) {
  const { t } = useI18n();
  const { items, busy, toggle } = useReservations(initialItems);

  if (items.length === 0) {
    return <div className="card p-8 text-center text-mute">{t('members.noItems')}</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <GiftRow
          key={it.id}
          item={it}
          busy={busy.has(it.id)}
          onToggle={() => toggle(it)}
          className="card p-4"
        />
      ))}
    </div>
  );
}
