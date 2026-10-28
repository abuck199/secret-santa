'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  Crown,
  Link2,
  Loader2,
  LogOut,
  Save,
  Shield,
  ShieldOff,
  Shuffle,
  Trash2,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import {
  deleteHousehold,
  leaveHousehold,
  removeMember,
  renameHousehold,
  setMemberRole,
  setSecretSanta,
} from '@/server/actions/households';
import { createInvite, deleteInvite } from '@/server/actions/invites';
import { shuffleAssignments } from '@/server/actions/santa';
import type { MyHousehold, Member } from '@/server/queries/households';
import type { Invite } from '@/server/queries/invites';

// Mirrors the server-side cap (5 non-expired links) to disable the button early.
const INVITE_CAP = 5;

type Confirm =
  | { type: 'removeMember'; member: Member }
  | { type: 'deleteInvite'; inviteId: string }
  | { type: 'leave' }
  | { type: 'delete' };

// Invite links point at whatever origin the app runs on (prod, preview, dev).
const noSubscribe = () => () => {};
const browserOrigin = () => window.location.origin;
const serverOrigin = () => 'https://thatwish.com';

export default function HouseholdSettings({
  household,
  initialMembers,
  initialInvites,
}: {
  household: MyHousehold;
  initialMembers: Member[];
  initialInvites: Invite[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const origin = useSyncExternalStore(noSubscribe, browserOrigin, serverOrigin);
  const isAdmin = household.role === 'admin';

  const [name, setName] = useState(household.name);
  const [secretSanta, setSecretSantaState] = useState(household.secretSantaEnabled);
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [savingName, setSavingName] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const fail = (res: Parameters<typeof actionErrorMessage>[1]) => toast.error(actionErrorMessage(t, res));
  const inviteLink = (code: string) => `${origin}/join/${code}`;
  const atInviteCap = invites.filter((i) => !i.isExpired).length >= INVITE_CAP;

  async function saveName() {
    if (!name.trim()) return;
    setSavingName(true);
    const res = await renameHousehold(household.id, name.trim());
    setSavingName(false);
    if (!res.ok) return fail(res);
    toast.success(t('settings.renamed'));
    router.refresh(); // nav + switcher show the new name
  }

  async function toggleSecretSanta() {
    const next = !secretSanta;
    setSecretSantaState(next);
    const res = await setSecretSanta(household.id, next);
    if (!res.ok) {
      setSecretSantaState(!next);
      return fail(res);
    }
    router.refresh(); // the Secret Santa tab appears / disappears
  }

  async function runDraw() {
    if (members.length < 3) return toast.error(t('settings.drawNeed'));
    setDrawing(true);
    const res = await shuffleAssignments(household.id);
    setDrawing(false);
    if (!res.ok) return fail(res);
    toast.success(t('settings.drawDone'));
  }

  async function addInvite() {
    if (creatingInvite) return; // guard against double-clicks
    if (atInviteCap) return toast.error(t('settings.inviteLimitHint', { max: INVITE_CAP }));
    setCreatingInvite(true);
    const res = await createInvite(household.id);
    setCreatingInvite(false);
    if (!res.ok) return fail(res);
    setInvites((prev) => [
      {
        ...res.data,
        createdAt: new Date(),
        isExpired: false,
        createdByMe: true,
        creatorName: '',
        joiners: [],
      },
      ...prev,
    ]);
    toast.success(t('settings.inviteCreated'));
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(t('err.generic'));
    }
  }

  async function toggleRole(m: Member) {
    const next = m.role === 'admin' ? 'member' : 'admin';
    const res = await setMemberRole(m.membershipId, next);
    if (!res.ok) return fail(res);
    setMembers((prev) => prev.map((x) => (x.membershipId === m.membershipId ? { ...x, role: next } : x)));
  }

  async function handleConfirm() {
    const c = confirm;
    setConfirm(null);
    if (!c) return;
    if (c.type === 'removeMember') {
      const res = await removeMember(c.member.membershipId);
      if (!res.ok) return fail(res);
      setMembers((prev) => prev.filter((x) => x.membershipId !== c.member.membershipId));
      toast.success(t('settings.removed', { name: c.member.displayName }));
    } else if (c.type === 'deleteInvite') {
      const res = await deleteInvite(c.inviteId);
      if (!res.ok) return fail(res);
      setInvites((prev) => prev.filter((x) => x.id !== c.inviteId));
    } else {
      const res = c.type === 'leave' ? await leaveHousehold(household.id) : await deleteHousehold(household.id);
      if (!res.ok) return fail(res);
      toast.success(c.type === 'leave' ? t('settings.left') : t('settings.deleted'));
      // Back to another household, or onboarding if that was the last one.
      router.push('/app');
      router.refresh();
    }
  }

  const confirmText: Record<Confirm['type'], { title: string; message: string }> = {
    delete: { title: t('settings.delete'), message: t('settings.deleteConfirm') },
    leave: { title: t('settings.leave'), message: t('settings.leaveConfirm') },
    removeMember: {
      title: t('settings.remove'),
      message: confirm?.type === 'removeMember' ? t('settings.removeConfirm', { name: confirm.member.displayName }) : '',
    },
    deleteInvite: { title: t('common.delete'), message: '' },
  };

  return (
    <Page>
      <PageHeader eyebrow={t('nav.settings')} title={t('settings.title')} />

      {!isAdmin && (
        <div className="card p-4 mb-4 bg-goldsoft/50 border-gold/20 text-sm text-fg">{t('settings.adminOnly')}</div>
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
            aria-label={t('settings.rename')}
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
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.membershipId} className="flex items-center gap-3 py-2.5">
              <div className="w-9 h-9 rounded-full bg-fg text-paper text-sm font-medium grid place-items-center">
                {(m.displayName[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg truncate">
                  {m.displayName} {m.isMe && <span className="text-mute font-normal">· {t('common.you')}</span>}
                </p>
                <span className="text-xs text-mute flex items-center gap-1">
                  {m.isOwner && <Crown className="w-3 h-3 text-gold" aria-hidden="true" />}
                  {m.role === 'admin' ? t('common.admin') : t('common.member')}
                </span>
              </div>
              {/* The owner and yourself can't be changed (the server says the same). */}
              {isAdmin && !m.isMe && !m.isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleRole(m)}
                    className="p-2 rounded-lg text-mute hover:text-fg hover:bg-panel-2"
                    title={m.role === 'admin' ? t('settings.removeAdmin') : t('settings.makeAdmin')}
                    aria-label={m.role === 'admin' ? t('settings.removeAdmin') : t('settings.makeAdmin')}
                  >
                    {m.role === 'admin' ? (
                      <ShieldOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Shield className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    onClick={() => setConfirm({ type: 'removeMember', member: m })}
                    className="p-2 rounded-lg text-mute hover:text-red-600 hover:bg-red-500/10"
                    title={t('settings.remove')}
                    aria-label={t('settings.remove')}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {isAdmin && (
        <Section title={t('settings.invites')}>
          <button
            className="btn-primary mb-2"
            onClick={addInvite}
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
              <div key={inv.id} className={`p-2.5 rounded-xl bg-panel-2 border border-line ${inv.isExpired ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-mute shrink-0" aria-hidden="true" />
                  <code className={`text-xs text-mute truncate flex-1 ${inv.isExpired ? 'line-through' : ''}`}>
                    {inviteLink(inv.code)}
                  </code>
                  {!inv.isExpired && (
                    <button
                      onClick={() => copy(inviteLink(inv.code), inv.id)}
                      className="p-1.5 rounded-lg text-mute hover:text-fg hover:bg-panel"
                      title={t('common.copy')}
                      aria-label={copied === inv.id ? t('common.copied') : t('common.copy')}
                    >
                      {copied === inv.id ? (
                        <Check className="w-4 h-4 text-gold" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ type: 'deleteInvite', inviteId: inv.id })}
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
                      name: inv.createdByMe ? t('common.you') : inv.creatorName || t('common.member'),
                    })}
                  </span>
                  {inv.joiners.length === 0 ? (
                    <span className="chip bg-panel text-mute border border-line">{t('settings.inviteUnused')}</span>
                  ) : (
                    <>
                      <span className="text-mute">{t('settings.inviteJoinedLabel', { count: inv.joiners.length })}</span>
                      {inv.joiners.map((j) => (
                        <span key={j.userId} className="chip bg-goldsoft text-gold border border-gold/30">
                          <Check className="w-3 h-3" aria-hidden="true" />
                          {j.name || t('common.member')}
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
        {/* The owner can't leave (the server refuses); they can only delete. */}
        {!household.isOwner && (
          <button className="btn-secondary text-red-600" onClick={() => setConfirm({ type: 'leave' })}>
            <LogOut className="w-4 h-4" /> {t('settings.leave')}
          </button>
        )}
        {household.isOwner && (
          <button className="btn-danger" onClick={() => setConfirm({ type: 'delete' })}>
            <Trash2 className="w-4 h-4" /> {t('settings.delete')}
          </button>
        )}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm ? confirmText[confirm.type].title : ''}
        message={confirm ? confirmText[confirm.type].message : ''}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </Page>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5 mb-4">
      <h2 className="font-serif text-lg font-medium text-fg mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ on, onClick, disabled, label }: { on: boolean; onClick: () => void; disabled?: boolean; label: string }) {
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
