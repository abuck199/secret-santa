import React, { useEffect, useState, useCallback } from 'react';
import {
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
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

// Max active (non-expired) invite links per household. Enforced for real by a
// DB trigger (see docs/invite-cap.sql); this is the matching UI guard.
const INVITE_CAP = 5;

export default function SettingsView() {
  const { t } = useI18n();
  const navigate = useNavigate();
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
  const [confirm, setConfirm] = useState(null);
  const [creatingInvite, setCreatingInvite] = useState(false);

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
    if (creatingInvite) return; // guard against double-clicks / spam
    const active = invites.filter((i) => !i.expires_at || new Date(i.expires_at) > new Date());
    if (active.length >= INVITE_CAP) {
      return toast.error(t('settings.inviteLimitHint', { max: INVITE_CAP }));
    }
    setCreatingInvite(true);
    try {
      const inv = await api.createInvite(currentHouseholdId);
      // Shape the fresh row like getInvites() returns (it has no joiners yet).
      setInvites((prev) => [
        { ...inv, creatorId: inv.invited_by || user?.id || null, creatorName: '', joiners: [] },
        ...prev,
      ]);
      toast.success(t('settings.inviteCreated'));
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setCreatingInvite(false);
    }
  }

  function inviteLink(code) {
    return `${window.location.origin}/join/${code}`;
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
      setMembers((prev) => prev.map((x) => (x.membershipId === m.membershipId ? { ...x, role: next } : x)));
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
        navigate('/app');
      } else if (c.type === 'delete') {
        await api.deleteHousehold(currentHouseholdId);
        toast.success(t('settings.deleted'));
        await afterHouseholdChange(null);
        navigate('/app');
      }
    } catch (e) {
      toast.error(e.message || t('err.generic'));
    }
  }

  const activeInviteCount = invites.filter(
    (i) => !i.expires_at || new Date(i.expires_at) > new Date()
  ).length;
  const atInviteCap = activeInviteCount >= INVITE_CAP;

  return (
    <Page>
      <PageHeader eyebrow={t('nav.settings')} title={t('settings.title')} />

      {!isAdmin && (
        <div className="card p-4 mb-4 bg-goldsoft/50 border-gold/20 text-sm text-fg">
          {t('settings.adminOnly')}
        </div>
      )}

      <Section title={t('settings.rename')}>
        <div className="flex gap-2">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            maxLength={60}
            placeholder={t('onboard.householdPlaceholder')}
          />
          {isAdmin && (
            <button
              className="btn-primary shrink-0"
              onClick={saveName}
              disabled={savingName}
              aria-busy={savingName}
              aria-label={t('common.save')}
            >
              {savingName ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{t('common.save')}</span>
            </button>
          )}
        </div>
      </Section>

      <Section title={t('settings.secretSanta')}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-mute">{t('settings.secretSantaDesc')}</p>
          <Toggle on={secretSanta} disabled={!isAdmin} onClick={toggleSecretSanta} label={t('settings.secretSanta')} />
        </div>
        {isAdmin && secretSanta && (
          <button className="btn-secondary mt-4" onClick={runDraw} disabled={drawing}>
            {drawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
            {t('settings.draw')}
          </button>
        )}
      </Section>

      <Section title={`${t('settings.members')} (${members.length})`}>
        {loading ? (
          <InlineLoading />
        ) : (
          <ul className="divide-y divide-line">
            {members.map((m) => {
              const isMe = m.userId === user?.id;
              return (
                <li key={m.membershipId} className="flex items-center gap-3 py-2.5">
                  <div className="w-9 h-9 rounded-full bg-fg text-paper text-sm font-medium grid place-items-center">
                    {(m.displayName[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-fg truncate">
                      {m.displayName} {isMe && <span className="text-mute font-normal">· {t('common.you')}</span>}
                    </p>
                    <span className="text-xs text-mute">
                      {m.role === 'admin' ? t('common.admin') : t('common.member')}
                    </span>
                  </div>
                  {isAdmin && !isMe && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleRole(m)}
                        className="p-2 rounded-lg text-mute hover:text-fg hover:bg-panel-2"
                        title={m.role === 'admin' ? t('settings.removeAdmin') : t('settings.makeAdmin')}
                        aria-label={m.role === 'admin' ? t('settings.removeAdmin') : t('settings.makeAdmin')}
                      >
                        {m.role === 'admin' ? <ShieldOff className="w-4 h-4" aria-hidden="true" /> : <Shield className="w-4 h-4" aria-hidden="true" />}
                      </button>
                      <button
                        onClick={() => setConfirm({ type: 'removeMember', payload: m })}
                        className="p-2 rounded-lg text-mute hover:text-red-600 hover:bg-red-500/10"
                        title={t('settings.remove')}
                        aria-label={t('settings.remove')}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {isAdmin && (
        <Section title={t('settings.invites')}>
          <button
            className="btn-primary mb-2"
            onClick={createInvite}
            disabled={creatingInvite || atInviteCap}
            aria-busy={creatingInvite}
          >
            {creatingInvite ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="w-4 h-4" aria-hidden="true" />
            )}
            {t('settings.createInvite')}
          </button>
          <p className="text-xs text-mute mb-3">
            {atInviteCap ? t('settings.inviteLimitHint', { max: INVITE_CAP }) : t('settings.inviteHint')}
          </p>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div key={inv.id} className="p-2.5 rounded-xl bg-panel-2 border border-line">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-mute shrink-0" aria-hidden="true" />
                  <code className="text-xs text-mute truncate flex-1">{inviteLink(inv.code)}</code>
                  <button
                    onClick={() => copy(inviteLink(inv.code), inv.id)}
                    className="p-1.5 rounded-lg text-mute hover:text-fg hover:bg-panel"
                    title={t('common.copy')}
                    aria-label={copied === inv.id ? t('common.copied') : t('common.copy')}
                  >
                    {copied === inv.id ? <Check className="w-4 h-4 text-gold" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                  <button
                    onClick={() => setConfirm({ type: 'deleteInvite', payload: inv.id })}
                    className="p-1.5 rounded-lg text-mute hover:text-red-600 hover:bg-panel"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 pl-6 text-xs flex-wrap">
                  <span className="text-mute">
                    {t('settings.inviteCreatedBy', {
                      name: inv.creatorId === user?.id ? t('common.you') : inv.creatorName || t('common.member'),
                    })}
                  </span>
                  {(inv.joiners || []).length === 0 ? (
                    <span className="chip bg-panel text-mute border border-line">{t('settings.inviteUnused')}</span>
                  ) : (
                    <>
                      <span className="text-mute">{t('settings.inviteJoinedLabel', { count: inv.joiners.length })}</span>
                      {inv.joiners.map((j) => (
                        <span key={j.userId} className="chip bg-goldsoft text-gold border border-gold/30">
                          <Check className="w-3 h-3" aria-hidden="true" />
                          {j.userId === user?.id ? t('common.you') : j.name || t('common.member')}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <button className="btn-secondary text-red-600" onClick={() => setConfirm({ type: 'leave' })}>
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
      <h2 className="font-serif text-lg font-medium text-fg mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ on, onClick, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition shrink-0 ${on ? 'bg-fg' : 'bg-line'} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-paper transition-transform ${on ? 'translate-x-5' : ''}`}
      />
    </button>
  );
}
