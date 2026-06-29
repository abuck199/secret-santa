import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, ExternalLink, Gift, Check, Loader2, Cake } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import { hostOf } from '../lib/url';
import { formatBirthday } from '../lib/dates';

export default function MembersView() {
  const { t, lang } = useI18n();
  const { currentHouseholdId, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [itemsByUser, setItemsByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(new Set());
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!currentHouseholdId) return;
    setLoading(true);
    try {
      const [mem, lists] = await Promise.all([
        api.getMembers(currentHouseholdId),
        api.getHouseholdWishlists(currentHouseholdId),
      ]);
      setMembers(mem);
      const grouped = {};
      for (const it of lists || []) {
        (grouped[it.user_id] = grouped[it.user_id] || []).push(it);
      }
      Object.values(grouped).forEach((arr) =>
        arr.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      );
      setItemsByUser(grouped);
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

  function setItemState(itemId, patch) {
    setItemsByUser((prev) => {
      const next = {};
      for (const [uid, arr] of Object.entries(prev)) {
        next[uid] = arr.map((it) => (it.id === itemId ? { ...it, ...patch } : it));
      }
      return next;
    });
  }

  async function toggleReserve(item) {
    if (busy.has(item.id)) return;
    setBusy((s) => new Set(s).add(item.id));
    try {
      if (item.reserved_by_me) {
        await api.cancelReservation(item.id);
        setItemState(item.id, { is_reserved: false, reserved_by_me: false, purchased_by_me: false });
        toast.success(t('members.cancelToast'));
      } else {
        await api.reserveItem(item.id);
        setItemState(item.id, { is_reserved: true, reserved_by_me: true });
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

  const q = query.trim().toLowerCase();
  const visibleMembers = useMemo(() => {
    const ordered = [...members].sort((a, b) => {
      if (a.userId === user?.id) return 1;
      if (b.userId === user?.id) return -1;
      return a.displayName.localeCompare(b.displayName);
    });
    if (!q) return ordered;
    return ordered.filter((m) => {
      if (m.displayName.toLowerCase().includes(q)) return true;
      return (itemsByUser[m.userId] || []).some((it) => it.item.toLowerCase().includes(q));
    });
  }, [members, itemsByUser, q, user]);

  return (
    <Page>
      <PageHeader eyebrow={t('nav.members')} title={t('members.title')} subtitle={t('members.subtitle')} />

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" aria-hidden="true" />
        <input
          type="search"
          className="input pl-11"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('members.search')}
          aria-label={t('members.search')}
        />
      </div>

      {loading ? (
        <InlineLoading />
      ) : (
        <div className="space-y-4">
          {visibleMembers.map((m, idx) => {
            const isMe = m.userId === user?.id;
            const items = itemsByUser[m.userId] || [];
            return (
              <div
                key={m.userId}
                className="card p-5 sm:p-6 animate-slide-up"
                style={{ animationDelay: `${Math.min(idx, 8) * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-fg text-paper font-medium grid place-items-center">
                    {(m.displayName[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-fg truncate flex items-center gap-2">
                      {m.displayName}
                      {isMe && <span className="text-mute font-normal">· {t('common.you')}</span>}
                      {m.role === 'admin' && (
                        <span className="chip bg-panel-2 text-mute border border-line">{t('common.admin')}</span>
                      )}
                    </p>
                    {m.birthday && (
                      <p className="text-xs text-mute flex items-center gap-1 mt-0.5">
                        <Cake className="w-3 h-3" /> {formatBirthday(m.birthday, lang)}
                      </p>
                    )}
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-sm text-mute pl-1">{t('members.noItems')}</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((it) => (
                      <ItemRow key={it.id} item={it} isMe={isMe} busy={busy.has(it.id)} onToggle={() => toggleReserve(it)} />
                    ))}
                  </div>
                )}

                {isMe && <p className="text-xs text-mute mt-3 italic">{t('members.ownList')}</p>}
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}

function ItemRow({ item, isMe, busy, onToggle }) {
  const { t } = useI18n();
  const reservedByOther = !isMe && item.is_reserved && !item.reserved_by_me;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-panel-2 border border-line">
      <div className="min-w-0 flex-1">
        <p className={`font-medium break-words ${reservedByOther ? 'text-mute line-through' : 'text-fg'}`}>
          {item.item}
        </p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-mute hover:text-gold transition mt-0.5"
          >
            <ExternalLink className="w-3 h-3" /> {hostOf(item.link)}
          </a>
        )}
      </div>

      {isMe ? null : item.reserved_by_me ? (
        <button
          onClick={onToggle}
          disabled={busy}
          className="chip bg-goldsoft text-gold border border-gold/30 hover:opacity-80 transition"
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
