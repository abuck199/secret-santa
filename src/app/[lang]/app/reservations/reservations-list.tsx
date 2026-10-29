'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Confetti, WrappedGift } from '@/components/Celebration';
import ConfirmModal from '@/components/ConfirmModal';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { hostOf } from '@/lib/url';
import { cancelReservation, setPurchased } from '@/server/actions/reservations';
import type { MyReservation } from '@/server/queries/wishlist';

// The gifts I said I'd give, grouped by recipient, with a "bought" tick.
export default function ReservationsList({
  householdName,
  initialRows,
}: {
  householdName: string;
  initialRows: MyReservation[];
}) {
  const { t } = useI18n();
  const [rows, setRows] = useState(initialRows);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [toCancel, setToCancel] = useState<MyReservation | null>(null);
  // Only ticks made during this visit animate.
  const [justBought, setJustBought] = useState<Set<string>>(new Set());

  // Rows arrive sorted by recipient name.
  const groups = useMemo(() => {
    const byOwner = new Map<string, { name: string; rows: MyReservation[] }>();
    for (const r of rows) {
      const g = byOwner.get(r.ownerId) ?? { name: r.ownerName, rows: [] };
      g.rows.push(r);
      byOwner.set(r.ownerId, g);
    }
    return [...byOwner.entries()];
  }, [rows]);
  const bought = rows.filter((r) => r.purchased).length;

  async function withBusy(id: string, fn: () => Promise<void>) {
    setBusy((s) => new Set(s).add(id));
    await fn();
    setBusy((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }

  const togglePurchased = (row: MyReservation) =>
    withBusy(row.id, async () => {
      const next = !row.purchased;
      const res = await setPurchased(row.id, next);
      if (!res.ok) return void toast.error(actionErrorMessage(t, res));
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, purchased: next } : r)));
      if (next) setJustBought((s) => new Set(s).add(row.id));
      toast.success(next ? t('res.purchasedToast') : t('res.notPurchasedToast'));
    });

  async function confirmCancel() {
    const row = toCancel;
    setToCancel(null);
    if (!row) return;
    await withBusy(row.id, async () => {
      const res = await cancelReservation(row.id);
      if (!res.ok) return void toast.error(actionErrorMessage(t, res));
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success(t('members.cancelToast'));
    });
  }

  return (
    <Page>
      <PageHeader eyebrow={householdName} title={t('res.title')} subtitle={t('res.subtitle')} />

      {rows.length === 0 ? (
        <div className="card p-8 text-center animate-rise [animation-delay:100ms]">
          <WrappedGift className="w-16 h-16 mx-auto mb-3" />
          <p className="text-[15px] text-mute">{t('res.empty')}</p>
          <Link className="btn-primary mt-5" href="/app/members">
            {t('dash.seeMembers')}
          </Link>
        </div>
      ) : (
        <>
          {/* How far along the shopping is. */}
          <div className="relative p-4 mb-6 rounded-3xl bg-sun-soft animate-rise [animation-delay:80ms]">
            <p className="text-base font-bold text-fg">
              {bought === rows.length ? t('res.allDone') : t('res.progress', { done: bought, total: rows.length })}
            </p>
            {/* Ticking the last one off is worth a little party. */}
            {bought === rows.length && justBought.size > 0 && <Confetti />}
            <div
              className="mt-2.5 h-3 rounded-full bg-white overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={rows.length}
              aria-valuenow={bought}
              aria-label={t('res.progress', { done: bought, total: rows.length })}
            >
              <div
                className="h-full rounded-full bg-sun transition-[width] duration-500 animate-[grow-w_0.8s_0.3s_cubic-bezier(0.2,0.9,0.3,1)_both]"
                style={{ width: `${(bought / rows.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            {groups.map(([ownerId, group], gi) => (
              <section key={ownerId} className="animate-rise" style={{ animationDelay: `${140 + gi * 80}ms` }}>
                <Link
                  href={`/app/members/${ownerId}`}
                  className="press flex items-center gap-2.5 min-h-11 mb-2 w-fit pr-2 rounded-full"
                >
                  <span
                    aria-hidden="true"
                    className="w-9 h-9 rounded-full bg-brand text-white grid place-items-center font-display font-black text-sm"
                  >
                    {(group.name[0] || '?').toUpperCase()}
                  </span>
                  <span className="heading text-lg text-fg">{t('member.for', { name: group.name })}</span>
                  <ChevronRight className="w-5 h-5 text-mute" strokeWidth={2.4} aria-hidden="true" />
                </Link>

                <ul className="space-y-2.5">
                  {group.rows.map((row) => {
                    const isBusy = busy.has(row.id);
                    return (
                      <li key={row.id} className="card p-3.5 flex gap-3">
                        <span className="w-14 h-14 shrink-0 rounded-2xl bg-brand-soft grid place-items-center">
                          <WrappedGift className="w-10 h-10" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-base font-bold leading-snug break-words ${
                              row.purchased ? 'text-mute' : 'text-fg'
                            }`}
                          >
                            {row.item}
                          </p>
                          {row.link && (
                            <a
                              href={row.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline mt-0.5"
                            >
                              {hostOf(row.link)}
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            <button
                              onClick={() => togglePurchased(row)}
                              disabled={isBusy}
                              aria-pressed={row.purchased}
                              className={`press inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-semibold ${
                                row.purchased ? 'bg-sun text-fg' : 'bg-panel-2 text-fg'
                              } ${justBought.has(row.id) && row.purchased ? 'animate-pop' : ''}`}
                            >
                              {isBusy ? (
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                              ) : row.purchased ? (
                                <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
                              ) : (
                                <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-mute" />
                              )}
                              {row.purchased ? t('res.purchased') : t('res.markPurchased')}
                            </button>
                            <button
                              onClick={() => setToCancel(row)}
                              disabled={isBusy}
                              className="press inline-flex items-center min-h-11 px-3.5 rounded-full text-sm font-semibold text-red-700 hover:bg-red-500/10"
                            >
                              {t('res.cancel')}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        open={!!toCancel}
        title={t('res.cancelTitle')}
        message={t('res.cancelMsg')}
        confirmLabel={t('res.cancel')}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      >
        <p className="mt-3 p-3 rounded-2xl bg-paper text-base font-bold text-fg break-words">{toCancel?.item}</p>
      </ConfirmModal>
    </Page>
  );
}
