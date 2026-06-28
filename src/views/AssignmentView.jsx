import React, { useEffect, useState, useCallback } from 'react';
import { Heart, ExternalLink, Gift, Check, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import { hostOf } from '../lib/url';

export default function AssignmentView({ setView }) {
  const { t } = useI18n();
  const { currentHousehold, currentHouseholdId } = useAuth();
  const enabled = currentHousehold?.secret_santa_enabled;

  const [receiver, setReceiver] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(new Set());

  const load = useCallback(async () => {
    if (!currentHouseholdId || !enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const assignment = await api.getMyAssignment(currentHouseholdId);
      if (!assignment) {
        setReceiver(null);
        setItems([]);
        return;
      }
      const [profiles, lists] = await Promise.all([
        api.getProfiles([assignment.receiver_id]),
        api.getHouseholdWishlists(currentHouseholdId),
      ]);
      setReceiver({
        id: assignment.receiver_id,
        name: profiles[0]?.display_name || '—',
      });
      setItems((lists || []).filter((it) => it.user_id === assignment.receiver_id));
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHouseholdId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleReserve(item) {
    if (busy.has(item.id)) return;
    setBusy((s) => new Set(s).add(item.id));
    try {
      if (item.reserved_by_me) {
        await api.cancelReservation(item.id);
        setItems((p) =>
          p.map((it) => (it.id === item.id ? { ...it, is_reserved: false, reserved_by_me: false } : it))
        );
        toast.success(t('members.cancelToast'));
      } else {
        await api.reserveItem(item.id);
        setItems((p) =>
          p.map((it) => (it.id === item.id ? { ...it, is_reserved: true, reserved_by_me: true } : it))
        );
        toast.success(t('members.reservedToast'));
      }
    } catch (e) {
      toast.error(t('members.takenToast'));
      load();
    } finally {
      setBusy((s) => {
        const n = new Set(s);
        n.delete(item.id);
        return n;
      });
    }
  }

  if (!enabled) {
    return (
      <Page>
        <PageHeader icon={Heart} title={t('assign.title')} />
        <div className="card p-10 text-center text-ink-400">{t('assign.disabled')}</div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader icon={Heart} title={t('assign.title')} />

      {loading ? (
        <InlineLoading />
      ) : !receiver ? (
        <div className="card p-10 text-center text-ink-400">{t('assign.notDrawn')}</div>
      ) : (
        <>
          <div className="card p-6 mb-5 text-center bg-mesh">
            <p className="text-sm text-ink-500 mb-2">{t('assign.subtitle')}</p>
            <div className="inline-flex items-center gap-2 text-2xl font-extrabold text-brand-700">
              <Sparkles className="w-6 h-6 text-accent-500" />
              {receiver.name}
              <Sparkles className="w-6 h-6 text-accent-500" />
            </div>
          </div>

          <h2 className="font-bold text-ink-900 mb-3">{t('assign.theirList')}</h2>
          {items.length === 0 ? (
            <div className="card p-8 text-center text-ink-400">{t('members.noItems')}</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => {
                const isBusy = busy.has(it.id);
                const takenByOther = it.is_reserved && !it.reserved_by_me;
                return (
                  <div
                    key={it.id}
                    className="card p-4 flex items-center gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium break-words ${
                          takenByOther ? 'text-ink-400 line-through' : 'text-ink-900'
                        }`}
                      >
                        {it.item}
                      </p>
                      {it.link && (
                        <a
                          href={it.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> {hostOf(it.link)}
                        </a>
                      )}
                    </div>
                    {it.reserved_by_me ? (
                      <button
                        onClick={() => toggleReserve(it)}
                        disabled={isBusy}
                        className="chip bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        {t('members.reservedByYou')}
                      </button>
                    ) : takenByOther ? (
                      <span className="chip bg-ink-100 text-ink-400">{t('members.reserved')}</span>
                    ) : (
                      <button
                        onClick={() => toggleReserve(it)}
                        disabled={isBusy}
                        className="btn-primary px-3 py-1.5 text-sm"
                      >
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                        {t('members.reserve')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Page>
  );
}
