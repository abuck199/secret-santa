'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, Loader2, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { hostOf } from '@/lib/url';
import { cancelReservation, setPurchased } from '@/server/actions/reservations';
import type { MyReservation } from '@/server/queries/wishlist';

export default function ReservationsList({ initialRows }: { initialRows: MyReservation[] }) {
  const { t } = useI18n();
  const [rows, setRows] = useState(initialRows);
  const [busy, setBusy] = useState<Set<string>>(new Set());

  async function mark(id: string, fn: () => Promise<void>) {
    setBusy((s) => new Set(s).add(id));
    await fn();
    setBusy((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }

  const togglePurchased = (row: MyReservation) =>
    mark(row.id, async () => {
      const next = !row.purchased;
      const res = await setPurchased(row.id, next);
      if (!res.ok) return void toast.error(actionErrorMessage(t, res));
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, purchased: next } : r)));
      toast.success(next ? t('res.purchasedToast') : t('res.notPurchasedToast'));
    });

  const cancel = (row: MyReservation) =>
    mark(row.id, async () => {
      const res = await cancelReservation(row.id);
      if (!res.ok) return void toast.error(actionErrorMessage(t, res));
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success(t('members.cancelToast'));
    });

  return (
    <Page>
      <PageHeader eyebrow={t('nav.reservations')} title={t('res.title')} subtitle={t('res.subtitle')} />

      {rows.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-panel-2 grid place-items-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 text-mute" strokeWidth={1.6} />
          </div>
          <p className="text-mute">{t('res.empty')}</p>
          <Link className="btn-secondary mt-5" href="/app/members">
            {t('dash.seeMembers')}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const isBusy = busy.has(row.id);
            return (
              <div
                key={row.id}
                className={`card p-4 flex items-center gap-3 animate-slide-up ${
                  row.purchased ? 'bg-goldsoft/50 border-gold/30' : ''
                }`}
                style={{ animationDelay: `${Math.min(i, 10) * 45}ms`, animationFillMode: 'backwards' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg break-words">{row.item}</p>
                  <p className="text-xs text-mute">{t('res.for', { name: row.ownerName })}</p>
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-mute hover:text-gold transition mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" /> {hostOf(row.link)}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => togglePurchased(row)}
                  disabled={isBusy}
                  className={`chip transition ${
                    row.purchased
                      ? 'bg-goldsoft text-gold border border-gold/30'
                      : 'bg-panel-2 text-mute border border-line hover:text-fg'
                  }`}
                >
                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {row.purchased ? t('res.purchased') : t('res.markPurchased')}
                </button>

                <button
                  onClick={() => cancel(row)}
                  disabled={isBusy}
                  className="p-2 rounded-lg text-mute hover:text-red-600 hover:bg-red-500/10"
                  title={t('res.cancel')}
                  aria-label={t('res.cancel')}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
