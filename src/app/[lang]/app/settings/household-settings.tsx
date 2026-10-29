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
  Share2,
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
// The native share sheet (Messages, Messenger, mail…) exists on phones; not on most desktops.
const browserCanShare = () => typeof navigator.share === 'function';
const serverCanShare = () => false;

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
  const canShare = useSyncExternalStore(noSubscribe, browserCanShare, serverCanShare);
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

  // Small labelled pill used for per-row actions (no icon-only buttons).
  const pill = 'press inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full text-sm font-semibold';

  return (
    <Page>
      <PageHeader eyebrow={household.name} title={t('settings.title')} />

      {!isAdmin && (
        <p className="flex items-start gap-2.5 p-4 mb-4 rounded-3xl bg-sun-soft text-[15px] text-fg animate-rise">
          <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" /> {t('settings.adminOnly')}
        </p>
      )}

      <Section title={t('settings.rename')} delay={60}>
        <form
          className="flex flex-col sm:flex-row gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            saveName();
          }}
        >
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
            <button type="submit" className="btn-primary shrink-0" disabled={savingName} aria-busy={savingName}>
              {savingName ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
              {t('common.save')}
            </button>
          )}
        </form>
      </Section>

      <Section title={t('settings.secretSanta')} delay={120}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[15px] text-mute">{t('settings.secretSantaDesc')}</p>
          <Toggle on={secretSanta} disabled={!isAdmin} onClick={toggleSecretSanta} label={t('settings.secretSanta')} />
        </div>
        {isAdmin && secretSanta && (
          <button className="btn-primary mt-4 animate-pop" onClick={runDraw} disabled={drawing}>
            {drawing ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
            ) : (
              <Shuffle className="w-[18px] h-[18px]" aria-hidden="true" />
            )}
            {t('settings.draw')}
          </button>
        )}
      </Section>

      <Section title={`${t('settings.members')} (${members.length})`} delay={180}>
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.membershipId} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-10 h-10 shrink-0 rounded-full bg-brand text-white grid place-items-center font-display font-black"
                >
                  {(m.displayName[0] || '?').toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-fg truncate">
                    {m.displayName} {m.isMe && <span className="text-mute font-normal">· {t('common.you')}</span>}
                  </p>
                  <span className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {m.isOwner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sun font-mono text-xs font-semibold">
                        <Crown className="w-3 h-3" aria-hidden="true" /> {t('settings.owner')}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-panel-2 font-mono text-xs font-semibold text-fg">
                      {m.role === 'admin' ? t('common.admin') : t('common.member')}
                    </span>
                  </span>
                </div>
              </div>
              {/* The owner and yourself can't be changed (the server says the same). */}
              {isAdmin && !m.isMe && !m.isOwner && (
                <div className="flex flex-wrap gap-2 mt-2 pl-[52px]">
                  <button onClick={() => toggleRole(m)} className={`${pill} bg-panel-2 text-fg`}>
                    {m.role === 'admin' ? (
                      <ShieldOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Shield className="w-4 h-4" aria-hidden="true" />
                    )}
                    {m.role === 'admin' ? t('settings.removeAdmin') : t('settings.makeAdmin')}
                  </button>
                  <button
                    onClick={() => setConfirm({ type: 'removeMember', member: m })}
                    className={`${pill} text-red-700 hover:bg-red-500/10`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> {t('settings.remove')}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {isAdmin && (
        <Section title={t('settings.invites')} delay={240}>
          <p className="text-[15px] text-mute mb-3">
            {atInviteCap ? t('settings.inviteLimitHint', { max: INVITE_CAP }) : t('settings.inviteHint')}
          </p>
          <button
            className="btn-primary mb-4"
            onClick={addInvite}
            disabled={creatingInvite || atInviteCap}
            aria-busy={creatingInvite}
          >
            {creatingInvite ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="w-[18px] h-[18px]" aria-hidden="true" />
            )}
            {t('settings.createInvite')}
          </button>
          <div className="space-y-2.5">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className={`p-3.5 rounded-2xl bg-paper animate-pop ${inv.isExpired ? 'opacity-60' : ''}`}
              >
                <p className="flex items-center gap-2 min-w-0">
                  <Link2 className="w-4 h-4 text-mute shrink-0" aria-hidden="true" />
                  <code className={`font-mono text-sm text-fg truncate ${inv.isExpired ? 'line-through' : ''}`}>
                    {inviteLink(inv.code)}
                  </code>
                </p>
                <p className="flex items-center gap-1.5 mt-1.5 text-sm text-mute flex-wrap">
                  {t('settings.inviteCreatedBy', {
                    name: inv.createdByMe ? t('common.you').toLowerCase() : inv.creatorName || t('common.member'),
                  })}
                  {' · '}
                  {inv.joiners.length === 0 ? (
                    t('settings.inviteUnused')
                  ) : (
                    <>
                      {t('settings.inviteJoinedLabel', { count: inv.joiners.length })}
                      {inv.joiners.map((j) => (
                        <span
                          key={j.userId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sun-soft font-semibold text-fg"
                        >
                          <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                          {j.name || t('common.member')}
                        </span>
                      ))}
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {!inv.isExpired && canShare && (
                    <button
                      onClick={() =>
                        navigator.share({ title: 'ThatWish', text: t('settings.shareText'), url: inviteLink(inv.code) }).catch(() => {})
                      }
                      className={`${pill} bg-fg text-white`}
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" /> {t('settings.share')}
                    </button>
                  )}
                  {!inv.isExpired && (
                    <button
                      onClick={() => copy(inviteLink(inv.code), inv.id)}
                      className={`${pill} ${copied === inv.id ? 'bg-sun text-fg' : 'bg-panel text-fg'}`}
                      aria-live="polite"
                    >
                      {copied === inv.id ? (
                        <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                      {copied === inv.id ? t('common.copied') : t('settings.copyLink')}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ type: 'deleteInvite', inviteId: inv.id })}
                    className={`${pill} text-red-700 hover:bg-red-500/10`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title={t('settings.dangerTitle')} delay={300}>
        {/* The owner can't leave (the server refuses); they can only delete. */}
        {!household.isOwner ? (
          <button className="btn-secondary text-red-700" onClick={() => setConfirm({ type: 'leave' })}>
            <LogOut className="w-[18px] h-[18px]" aria-hidden="true" /> {t('settings.leave')}
          </button>
        ) : (
          <button className="btn-danger" onClick={() => setConfirm({ type: 'delete' })}>
            <Trash2 className="w-[18px] h-[18px]" aria-hidden="true" /> {t('settings.delete')}
          </button>
        )}
      </Section>

      <ConfirmModal
        open={!!confirm}
        title={confirm ? confirmText[confirm.type].title : ''}
        message={confirm ? confirmText[confirm.type].message : ''}
        confirmLabel={confirm ? confirmText[confirm.type].title : undefined}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </Page>
  );
}

function Section({ title, delay = 0, children }: { title: string; delay?: number; children: ReactNode }) {
  return (
    <section className="card p-5 mb-4 animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="heading text-lg text-fg mb-3">{title}</h2>
      {children}
    </section>
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
      className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${on ? 'bg-brand' : 'bg-line'} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-soft transition-transform [transition-timing-function:cubic-bezier(0.3,1.6,0.5,1)] ${
          on ? 'translate-x-6' : ''
        }`}
      />
    </button>
  );
}
