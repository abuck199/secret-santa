'use client';

import { useState } from 'react';
import { ArrowLeftRight, EyeOff, Loader2, Megaphone, Plus, RotateCcw, Shuffle, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import DrawCeremony from '@/components/DrawCeremony';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { addExclusion, announceDraw, removeExclusion, shuffleAssignments } from '@/server/actions/santa';
import type { Member } from '@/server/queries/households';
import type { SantaAdmin as SantaAdminData } from '@/server/queries/santa';

const pill = 'press inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full text-sm font-semibold';

// The admin's side of Secret Santa: pairs who must not draw each other, then
// draw (a hidden draft, redo at will), then announce (everyone sees their own
// match and gets an email). The admin never sees who drew whom.
export default function SantaAdmin({
  householdId,
  members,
  initial,
}: {
  householdId: string;
  members: Member[];
  initial: SantaAdminData;
}) {
  const { t } = useI18n();
  const [allExclusions, setExclusions] = useState(initial.exclusions);
  // Removing a member drops their pairs on the server too.
  const exclusions = allExclusions.filter((e) => members.some((m) => m.userId === e.a.id) && members.some((m) => m.userId === e.b.id));
  const [drawn, setDrawn] = useState(initial.drawn);
  const [announced, setAnnounced] = useState(initial.announced);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [busy, setBusy] = useState<null | 'add' | 'draw' | 'announce'>(null);
  // Pairs edited after the draw: it may not respect them any more. Said
  // without checking the draw itself, which would hint at who drew whom.
  const [stale, setStale] = useState(false);
  const [confirm, setConfirm] = useState<null | 'announce' | 'redraw'>(null);
  const [ceremony, setCeremony] = useState(false);

  const fail = (res: Parameters<typeof actionErrorMessage>[1]) => toast.error(actionErrorMessage(t, res));
  const nameOf = (id: string) => members.find((m) => m.userId === id)?.displayName ?? '';
  const taken = new Set(exclusions.map((e) => [e.a.id, e.b.id].sort().join('|')));
  const canAdd = !!a && !!b && a !== b && !taken.has([a, b].sort().join('|'));

  async function add() {
    if (!canAdd || busy) return;
    setBusy('add');
    const res = await addExclusion(householdId, a, b);
    setBusy(null);
    if (!res.ok) return fail(res);
    setExclusions((prev) => [...prev, { id: res.data.id, a: { id: a, name: nameOf(a) }, b: { id: b, name: nameOf(b) } }]);
    setA('');
    setB('');
    if (drawn) setStale(true);
  }

  async function remove(id: string) {
    const res = await removeExclusion(householdId, id);
    if (!res.ok) return fail(res);
    setExclusions((prev) => prev.filter((e) => e.id !== id));
    if (drawn) setStale(true);
  }

  async function draw() {
    if (members.length < 3) return toast.error(t('settings.drawNeed'));
    setBusy('draw');
    const res = await shuffleAssignments(householdId);
    setBusy(null);
    if (!res.ok) return fail(res);
    setDrawn(true);
    setAnnounced(false);
    setStale(false);
    setCeremony(true); // its closing text explains the draft
  }

  async function announce() {
    setBusy('announce');
    const res = await announceDraw(householdId);
    setBusy(null);
    if (!res.ok) return fail(res);
    setAnnounced(true);
    if (res.data.emailed) toast.success(t('santa.announced'));
    else toast(t('santa.announcedNoEmail'), { duration: 8000 });
  }

  function onConfirm() {
    const c = confirm;
    setConfirm(null);
    if (c === 'announce') announce();
    else if (c === 'redraw') draw();
  }

  const spinner = <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />;

  return (
    <div className="mt-5 space-y-5">
      {/* 1. Exclusions */}
      <div className="p-4 rounded-2xl bg-paper">
        <h3 className="flex items-center gap-2 text-base font-bold text-fg">
          <Users className="w-[18px] h-[18px] text-brand-ink" aria-hidden="true" /> {t('santa.exclusionsTitle')}
        </h3>
        <p className="text-[15px] text-mute mt-1 mb-3">{t('santa.exclusionsHint')}</p>

        {exclusions.length === 0 ? (
          <p className="text-sm text-mute italic mb-3">{t('santa.noExclusions')}</p>
        ) : (
          <ul className="space-y-2 mb-3">
            {exclusions.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 pl-3.5 pr-1.5 py-1.5 rounded-2xl bg-panel animate-pop"
                aria-label={t('santa.pairLabel', { a: e.a.name, b: e.b.name })}
              >
                <span className="flex items-center gap-2 min-w-0 font-semibold text-fg">
                  <span className="truncate">{e.a.name}</span>
                  <ArrowLeftRight className="w-4 h-4 shrink-0 text-brand-ink" aria-hidden="true" />
                  <span className="truncate">{e.b.name}</span>
                </span>
                <button onClick={() => remove(e.id)} className={`${pill} text-red-700 hover:bg-red-500/10`}>
                  <Trash2 className="w-4 h-4" aria-hidden="true" /> {t('santa.removeExclusion')}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <MemberSelect label={t('santa.personA')} value={a} onChange={setA} members={members} exclude={b} />
          <ArrowLeftRight className="hidden sm:block w-5 h-5 mb-3 text-mute" aria-hidden="true" />
          <MemberSelect label={t('santa.personB')} value={b} onChange={setB} members={members} exclude={a} />
          <button type="submit" className="btn-secondary sm:col-span-3 justify-self-start" disabled={!canAdd || !!busy}>
            {busy === 'add' ? spinner : <Plus className="w-[18px] h-[18px]" aria-hidden="true" />}
            {t('santa.addExclusion')}
          </button>
        </form>
      </div>

      {/* 2. Draw, then announce */}
      {drawn && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl ${announced ? 'bg-brand-soft' : 'bg-sun-soft'}`}>
          {announced ? (
            <Megaphone className="w-5 h-5 shrink-0 mt-0.5 text-brand-ink" aria-hidden="true" />
          ) : (
            <EyeOff className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="text-[15px] text-fg">
            <span className="inline-block px-2 py-0.5 mb-1 rounded-full bg-panel font-mono text-xs font-semibold uppercase tracking-wide">
              {announced ? t('santa.statusAnnouncedLabel') : t('santa.statusDraftLabel')}
            </span>
            <p>{announced ? t('santa.statusAnnounced') : t('santa.statusDraft')}</p>
            {stale && <p className="mt-1.5 font-semibold">{t('santa.redrawNeeded')}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {!drawn ? (
          <button className="btn-primary animate-pop" onClick={draw} disabled={!!busy}>
            {busy === 'draw' ? spinner : <Shuffle className="w-[18px] h-[18px]" aria-hidden="true" />}
            {t('settings.draw')}
          </button>
        ) : (
          <>
            {!announced && (
              <button className="btn-primary animate-pop" onClick={() => setConfirm('announce')} disabled={!!busy}>
                {busy === 'announce' ? spinner : <Megaphone className="w-[18px] h-[18px]" aria-hidden="true" />}
                {t('santa.announce')}
              </button>
            )}
            <button
              className={announced || stale ? 'btn-primary' : 'btn-secondary'}
              // A draft can be redone freely; an announced draw changes everyone's match.
              onClick={() => (announced ? setConfirm('redraw') : draw())}
              disabled={!!busy}
            >
              {busy === 'draw' ? spinner : <RotateCcw className="w-[18px] h-[18px]" aria-hidden="true" />}
              {t('santa.redraw')}
            </button>
          </>
        )}
      </div>

      {ceremony && <DrawCeremony names={members.map((m) => m.displayName)} onClose={() => setCeremony(false)} />}

      <ConfirmModal
        open={!!confirm}
        danger={confirm === 'redraw'}
        icon={confirm === 'announce' ? <Megaphone className="w-6 h-6" aria-hidden="true" /> : undefined}
        title={confirm === 'announce' ? t('santa.announceTitle') : t('santa.redrawTitle')}
        message={confirm === 'announce' ? t('santa.announceText') : t('santa.redrawText')}
        confirmLabel={confirm === 'announce' ? t('santa.announce') : t('santa.redraw')}
        onConfirm={onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function MemberSelect({
  label,
  value,
  onChange,
  members,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  members: Member[];
  exclude: string;
}) {
  const { t } = useI18n();
  return (
    <label className="block min-w-0">
      <span className="label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('santa.choose')}</option>
        {members
          .filter((m) => m.userId !== exclude)
          .map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.displayName}
            </option>
          ))}
      </select>
    </label>
  );
}
