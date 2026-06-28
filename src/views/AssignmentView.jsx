import React, { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Gift, Check, Loader2 } from 'lucide-react';
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
      setReceiver({ id: assignment.receiver_id, name: profiles[0]?.display_name || '—' });
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
        setItems((p) => p.map((it) => (it.id === item.id ? { ...it, is_reserved: false, reserved_by_me: false } : it)));
        toast.success(t('members.cancelToast'));
      } else {
        await api.reserveItem(item.id);
        setItems((p) => p.map((it) => (it.id === item.id ? { ...it, is_reserved: true, reserved_by_me: true } : it)));
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
        <PageHeader eyebrow={t('nav.assignment')} title={t('assign.title')} />
        <div className="card p-12 text-center text-mute">{t('assign.disabled')}</div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader eyebrow={t('nav.assignment')} title={t('assign.title')} />

      {loading ? (
        <InlineLoading />
      ) : !receiver ? (
        <div className="card p-12 text-center text-mute">{t('assign.notDrawn')}</div>
      ) : (
        <>
          <div className="card lift p-7 mb-6 text-center bg-goldsoft/40 animate-scale-in">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-3">
              {t('assign.subtitle')}
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-medium text-fg tracking-tight">
              {receiver.name}
            </p>
          </div>

          <h2 className="font-serif text-lg font-medium text-fg mb-3">{t('assign.theirList')}</h2>
          {items.length === 0 ? (
            <div className="card p-8 text-center text-mute">{t('members.noItems')}</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => {
                const isBusy = busy.has(it.id);
                const takenByOther = it.is_reserved && !it.reserved_by_me;
                return (
                  <div key={it.id} className="card p-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium break-words ${takenByOther ? 'text-mute line-through' : 'text-fg'}`}>
                        {it.item}
                      </p>
                      {it.link && (
                        <a
                          href={it.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-mute hover:text-gold transition mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> {hostOf(it.link)}
                        </a>
                      )}
                    </div>
                    {it.reserved_by_me ? (
                      <button
                        onClick={() => toggleReserve(it)}
                        disabled={isBusy}
                        className="chip bg-goldsoft text-gold border border-gold/30 hover:opacity-80"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        {t('members.reservedByYou')}
                      </button>
                    ) : takenByOther ? (
                      <span className="chip bg-panel-2 text-mute border border-line">{t('members.reserved')}</span>
                    ) : (
                      <button onClick={() => toggleReserve(it)} disabled={isBusy} className="btn-primary px-3 py-1.5 text-sm">
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
