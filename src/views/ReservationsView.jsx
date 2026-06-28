import React, { useEffect, useState, useCallback } from 'react';
import { Gift, ExternalLink, Check, X, Loader2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import { hostOf } from '../lib/url';

export default function ReservationsView({ setView }) {
  const { t } = useI18n();
  const { currentHouseholdId } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(new Set());

  const load = useCallback(async () => {
    if (!currentHouseholdId) return;
    setLoading(true);
    try {
      const res = await api.getMyReservations();
      const mine = (res || []).filter((r) => r.household_id === currentHouseholdId);
      const ownerIds = [...new Set(mine.map((r) => r.owner_id))];
      const profiles = await api.getProfiles(ownerIds);
      const byId = Object.fromEntries(profiles.map((p) => [p.id, p.display_name]));
      setRows(mine.map((r) => ({ ...r, ownerName: byId[r.owner_id] || '—' })));
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHouseholdId]);

  useEffect(() => {
    load();
  }, [load]);

  function mark(id, fn) {
    setBusy((s) => new Set(s).add(id));
    return fn().finally(() =>
      setBusy((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      })
    );
  }

  async function togglePurchased(row) {
    await mark(row.id, async () => {
      try {
        const next = !row.purchased;
        await api.setPurchased(row.id, next);
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, purchased: next } : r)));
        toast.success(next ? t('res.purchasedToast') : t('res.notPurchasedToast'));
      } catch (e) {
        toast.error(t('err.generic'));
      }
    });
  }

  async function cancel(row) {
    await mark(row.id, async () => {
      try {
        await api.cancelReservation(row.id);
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        toast.success(t('members.cancelToast'));
      } catch (e) {
        toast.error(t('err.generic'));
      }
    });
  }

  return (
    <Page>
      <PageHeader icon={Gift} title={t('res.title')} subtitle={t('res.subtitle')} />

      {loading ? (
        <InlineLoading />
      ) : rows.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-400">{t('res.empty')}</p>
          <button className="btn-secondary mt-4" onClick={() => setView('members')}>
            {t('dash.seeMembers')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const isBusy = busy.has(row.id);
            return (
              <div
                key={row.id}
                className={`card p-4 flex items-center gap-3 ${
                  row.purchased ? 'bg-emerald-50/60 border-emerald-200' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900 break-words">{row.item}</p>
                  <p className="text-xs text-ink-400">{t('res.for', { name: row.ownerName })}</p>
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-0.5"
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
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  {row.purchased ? t('res.purchased') : t('res.markPurchased')}
                </button>

                <button
                  onClick={() => cancel(row)}
                  disabled={isBusy}
                  className="p-2 rounded-lg text-ink-400 hover:text-accent-600 hover:bg-accent-50"
                  title={t('res.cancel')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
