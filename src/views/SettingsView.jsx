import React, { useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Save,
  Shuffle,
  UserPlus,
  Link2,
  Copy,
  Trash2,
  Shield,
  ShieldOff,
  LogOut,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingsView({ setView }) {
  const { t } = useI18n();
  const {
    currentHousehold,
    currentHouseholdId,
    isAdmin,
    isOwner,
    user,
    refreshHouseholds,
    afterHouseholdChange,
  } = useAuth();

  const [name, setName] = useState(currentHousehold?.name || '');
  const [secretSanta, setSecretSanta] = useState(!!currentHousehold?.secret_santa_enabled);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [copied, setCopied] = useState(null);
  const [confirm, setConfirm] = useState(null); // {type, payload}

  useEffect(() => {
    setName(currentHousehold?.name || '');
    setSecretSanta(!!currentHousehold?.secret_santa_enabled);
  }, [currentHousehold]);

  const load = useCallback(async () => {
    if (!currentHouseholdId) return;
    setLoading(true);
    try {
      const [mem, inv] = await Promise.all([
        api.getMembers(currentHouseholdId),
        isAdmin ? api.getInvites(currentHouseholdId) : Promise.resolve([]),
      ]);
      setMembers(mem);
      setInvites(inv);
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHouseholdId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveName() {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await api.renameHousehold(currentHouseholdId, name.trim());
      await refreshHouseholds();
      toast.success(t('settings.renamed'));
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setSavingName(false);
    }
  }

  async function toggleSecretSanta() {
    const next = !secretSanta;
    setSecretSanta(next);
    try {
      await api.setSecretSanta(currentHouseholdId, next);
      await refreshHouseholds();
    } catch (e) {
      setSecretSanta(!next);
      toast.error(t('err.generic'));
    }
  }

  async function runDraw() {
    if (members.length < 3) return toast.error(t('settings.drawNeed'));
    setDrawing(true);
    try {
      await api.shuffleAssignments(currentHouseholdId);
      toast.success(t('settings.drawDone'));
    } catch (e) {
      toast.error(e.message || t('err.generic'));
    } finally {
      setDrawing(false);
    }
  }

  async function createInvite() {
    try {
      const inv = await api.createInvite(currentHouseholdId);
      setInvites((prev) => [inv, ...prev]);
      toast.success(t('settings.inviteCreated'));
    } catch (e) {
      toast.error(t('err.generic'));
    }
  }

  function inviteLink(code) {
    return `${window.location.origin}/?invite=${code}`;
  }

  async function copy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {
      toast.error(t('err.generic'));
    }
  }

  async function toggleRole(m) {
    try {
      const next = m.role === 'admin' ? 'member' : 'admin';
      await api.setMemberRole(m.membershipId, next);
      setMembers((prev) =>
        prev.map((x) => (x.membershipId === m.membershipId ? { ...x, role: next } : x))
      );
    } catch (e) {
      toast.error(t('err.generic'));
    }
  }

  async function handleConfirm() {
    const c = confirm;
    setConfirm(null);
    if (!c) return;
    try {
      if (c.type === 'removeMember') {
        await api.removeMember(c.payload.membershipId);
        setMembers((prev) => prev.filter((x) => x.membershipId !== c.payload.membershipId));
        toast.success(t('settings.removed', { name: c.payload.displayName }));
      } else if (c.type === 'deleteInvite') {
        await api.deleteInvite(c.payload);
        setInvites((prev) => prev.filter((x) => x.id !== c.payload));
      } else if (c.type === 'leave') {
        await api.leaveHousehold(currentHouseholdId);
        toast.success(t('settings.left'));
        await afterHouseholdChange(null);
        setView('dashboard');
      } else if (c.type === 'delete') {
        await api.deleteHousehold(currentHouseholdId);
        toast.success(t('settings.deleted'));
        await afterHouseholdChange(null);
        setView('dashboard');
      }
    } catch (e) {
      toast.error(e.message || t('err.generic'));
    }
  }

  return (
    <Page>
      <PageHeader icon={Settings} title={t('settings.title')} />

      {!isAdmin && (
        <div className="card p-4 mb-4 bg-brand-50/60 border-brand-200 text-sm text-brand-700">
          {t('settings.adminOnly')}
        </div>
      )}

      {/* Name */}
      <Section title={t('settings.rename')}>
        <div className="flex gap-2">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            maxLength={60}
          />
          {isAdmin && (
            <button className="btn-primary shrink-0" onClick={saveName} disabled={savingName}>
              {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('common.save')}</span>
            </button>
          )}
        </div>
      </Section>

      {/* Secret Santa */}
      <Section title={t('settings.secretSanta')}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-500">{t('settings.secretSantaDesc')}</p>
          <Toggle on={secretSanta} disabled={!isAdmin} onClick={toggleSecretSanta} />
        </div>
        {isAdmin && secretSanta && (
          <button className="btn-secondary mt-4" onClick={runDraw} disabled={drawing}>
            {drawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
            {t('settings.draw')}
          </button>
        )}
      </Section>

      {/* Members */}
      <Section title={`${t('settings.members')} (${members.length})`}>
        {loading ? (
          <InlineLoading />
        ) : (
          <ul className="divide-y divide-ink-100">
            {members.map((m) => {
              const isMe = m.userId === user?.id;
              return (
                <li key={m.membershipId} className="flex items-center gap-3 py-2.5">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-bold grid place-items-center">
                    {(m.displayName[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900 truncate">
                      {m.displayName} {isMe && <span className="text-ink-400 font-normal">({t('common.you')})</span>}
                    </p>
                    <span className="text-xs text-ink-400">
                      {m.role === 'admin' ? t('common.admin') : t('common.member')}
                    </span>
                  </div>
                  {isAdmin && !isMe && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleRole(m)}
                        className="p-2 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50"
                        title={m.role === 'admin' ? t('settings.removeAdmin') : t('settings.makeAdmin')}
                      >
                        {m.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setConfirm({ type: 'removeMember', payload: m })}
                        className="p-2 rounded-lg text-ink-400 hover:text-accent-600 hover:bg-accent-50"
                        title={t('settings.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Invites */}
      {isAdmin && (
        <Section title={t('settings.invites')}>
          <button className="btn-primary mb-3" onClick={createInvite}>
            <UserPlus className="w-4 h-4" /> {t('settings.createInvite')}
          </button>
          <p className="text-xs text-ink-400 mb-3">{t('settings.inviteHint')}</p>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-ink-50 border border-ink-100"
              >
                <Link2 className="w-4 h-4 text-ink-400 shrink-0" />
                <code className="text-xs text-ink-600 truncate flex-1">{inviteLink(inv.code)}</code>
                <button
                  onClick={() => copy(inviteLink(inv.code), inv.id)}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-white"
                  title={t('common.copy')}
                >
                  {copied === inv.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setConfirm({ type: 'deleteInvite', payload: inv.id })}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-accent-600 hover:bg-white"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Danger zone */}
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <button
          className="btn-secondary text-accent-600"
          onClick={() => setConfirm({ type: 'leave' })}
        >
          <LogOut className="w-4 h-4" /> {t('settings.leave')}
        </button>
        {isOwner && (
          <button className="btn-danger" onClick={() => setConfirm({ type: 'delete' })}>
            <Trash2 className="w-4 h-4" /> {t('settings.delete')}
          </button>
        )}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === 'delete'
            ? t('settings.delete')
            : confirm?.type === 'leave'
            ? t('settings.leave')
            : confirm?.type === 'removeMember'
            ? t('settings.remove')
            : t('common.delete')
        }
        message={
          confirm?.type === 'delete'
            ? t('settings.deleteConfirm')
            : confirm?.type === 'leave'
            ? t('settings.leaveConfirm')
            : confirm?.type === 'removeMember'
            ? t('settings.removeConfirm', { name: confirm?.payload?.displayName })
            : ''
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </Page>
  );
}

function Section({ title, children }) {
  return (
    <div className="card p-5 mb-4">
      <h2 className="font-bold text-ink-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ on, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition shrink-0 ${
        on ? 'bg-brand-600' : 'bg-ink-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}
