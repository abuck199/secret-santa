'use client';

import { useState } from 'react';
import { Check, ExternalLink, Gift, Loader2, Lock } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { hostOf } from '@/lib/url';
import type { HouseholdItem } from '@/server/queries/wishlist';
import { Confetti, WrappedGift } from './Celebration';
import ConfirmModal from './ConfirmModal';
import { useReservations } from './GiftRow';

// Someone else's wishlist as cards: "I'll give it" asks for confirmation
// (explaining the anonymity in plain words), then the gift wraps itself.
export default function WishCards({ items: initialItems, ownerName }: { items: HouseholdItem[]; ownerName: string }) {
  const { t } = useI18n();
  const { items, busy, toggle } = useReservations(initialItems);
  const [asking, setAsking] = useState<HouseholdItem | null>(null);
  // Only gifts chosen during this visit get the wrapping animation.
  const [justGiven, setJustGiven] = useState<Set<string>>(new Set());

  async function confirmGive() {
    const item = asking;
    setAsking(null);
    if (item && (await toggle(item))) setJustGiven((s) => new Set(s).add(item.id));
  }

  async function cancelGive(item: HouseholdItem) {
    if (await toggle(item)) {
      setJustGiven((s) => {
        const n = new Set(s);
        n.delete(item.id);
        return n;
      });
    }
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((item, i) => {
          const mine = item.reservedByMe;
          const taken = item.isReserved && !mine;
          const fresh = justGiven.has(item.id);
          return (
            <li
              key={item.id}
              className={`animate-rise p-4 rounded-3xl ${
                taken ? 'border-2 border-dashed border-line' : 'bg-panel shadow-soft'
              }`}
              style={{ animationDelay: `${200 + Math.min(i, 8) * 60}ms` }}
            >
              <div className="flex gap-3.5">
                <span
                  className={`relative w-16 h-16 shrink-0 rounded-2xl grid place-items-center ${
                    taken ? 'bg-panel-2 text-mute' : 'bg-brand-soft text-brand-ink'
                  }`}
                >
                  {/* A chosen gift is a wrapped gift: yours in raspberry, someone else's in grey. */}
                  {mine ? (
                    <WrappedGift animate={fresh} className="w-11 h-11" />
                  ) : taken ? (
                    <WrappedGift box="rgb(var(--mute) / 0.35)" ribbon="rgb(var(--mute))" className="w-11 h-11" />
                  ) : (
                    <Gift className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className={`text-base font-bold leading-snug break-words ${taken ? 'text-mute' : 'text-fg'}`}>
                    {item.item}
                  </h3>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 min-h-8 text-[15px] font-semibold text-brand-ink hover:underline"
                    >
                      {hostOf(item.link)}
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                  {taken && (
                    <p className="flex items-center gap-1.5 mt-1 text-[15px] font-semibold text-mute">
                      <Lock className="w-4 h-4" aria-hidden="true" /> {t('member.takenByOther')}
                    </p>
                  )}
                </div>
              </div>

              {!taken && (
                <div className="relative mt-3.5">
                  {mine ? (
                    <div className="flex gap-2.5">
                      <span
                        className={`flex-1 inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-sun text-fg text-[15px] font-semibold ${
                          fresh ? 'animate-pop' : ''
                        }`}
                      >
                        <Check className="w-5 h-5" strokeWidth={3} aria-hidden="true" /> {t('member.youGive')}
                      </span>
                      <button
                        className="btn-secondary"
                        onClick={() => cancelGive(item)}
                        disabled={busy.has(item.id)}
                      >
                        {busy.has(item.id) && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        {t('common.cancel')}
                      </button>
                      {fresh && <Confetti />}
                    </div>
                  ) : (
                    <button
                      className="btn-primary w-full"
                      onClick={() => setAsking(item)}
                      disabled={busy.has(item.id)}
                    >
                      {busy.has(item.id) && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                      {t('member.giveIt')}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmModal
        open={!!asking}
        danger={false}
        icon={<Gift className="w-6 h-6" aria-hidden="true" />}
        eyebrow={t('member.for', { name: ownerName })}
        title={t('member.confirmTitle')}
        confirmLabel={t('member.confirmYes')}
        cancelLabel={t('member.confirmNo')}
        onConfirm={confirmGive}
        onCancel={() => setAsking(null)}
      >
        {/* The item in plain case: long names read badly in the uppercase title. */}
        <p className="mt-3 p-3 rounded-2xl bg-paper text-base font-bold text-fg break-words">{asking?.item}</p>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-fg">
          {[t('member.why1'), t('member.why2', { name: ownerName }), t('member.why3')].map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden="true" className="w-2 h-2 mt-2 shrink-0 rounded-full bg-brand" />
              {line}
            </li>
          ))}
        </ul>
      </ConfirmModal>
    </>
  );
}
