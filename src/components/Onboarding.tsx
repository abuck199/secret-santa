'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { createHousehold } from '@/server/actions/households';
import { acceptInvite } from '@/server/actions/invites';
import AuthShell from './AuthShell';

// Pasted invite links work too: keep only the code after /join/.
function codeFrom(input: string) {
  const trimmed = input.trim();
  return trimmed.match(/\/join\/([^/?#\s]+)/)?.[1] ?? trimmed;
}

// Shown when a signed-in user belongs to no household yet. Also reachable from
// the nav ("New / join household") as `embedded`.
export default function Onboarding({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});
  const nameId = useId();
  const codeId = useId();

  const selectTab = (key: 'create' | 'join') => {
    setTab(key);
    setErrors({});
  };

  // The action already made the new household the current one.
  function done() {
    router.push('/app');
    router.refresh();
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErrors({ name: t('common.required') });
    setLoading(true);
    const res = await createHousehold(name.trim());
    setLoading(false);
    if (!res.ok) return toast.error(actionErrorMessage(t, res));
    toast.success(t('onboard.created'));
    done();
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return setErrors({ code: t('common.required') });
    setLoading(true);
    const res = await acceptInvite(codeFrom(code));
    setLoading(false);
    if (!res.ok) return toast.error(actionErrorMessage(t, res));
    toast.success(t('onboard.joined', { name: res.data.householdName }));
    done();
  }

  const tabClass = (key: string) =>
    `flex-1 min-h-11 rounded-full text-[15px] font-semibold transition ${
      tab === key ? 'bg-panel text-fg shadow-soft' : 'text-mute hover:text-fg'
    }`;

  // Segmented tabs + the active form - same building blocks as AuthShell.
  const tabsAndForm = (
    <>
      <div className="flex gap-1 p-1 bg-panel-2 rounded-full mb-6">
        <button type="button" onClick={() => selectTab('create')} aria-pressed={tab === 'create'} className={tabClass('create')}>
          {t('onboard.createTab')}
        </button>
        <button type="button" onClick={() => selectTab('join')} aria-pressed={tab === 'join'} className={tabClass('join')}>
          {t('onboard.joinTab')}
        </button>
      </div>

      {tab === 'create' ? (
        <form onSubmit={handleCreate}>
          <label htmlFor={nameId} className="label">{t('onboard.householdName')}</label>
          <input
            id={nameId}
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder={t('onboard.householdPlaceholder')}
            maxLength={60}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${nameId}-err` : undefined}
          />
          {errors.name && <p id={`${nameId}-err`} role="alert" className="text-sm font-semibold text-red-700 mt-1.5">{errors.name}</p>}
          <button className="btn-primary w-full mt-5" disabled={loading} aria-busy={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('onboard.createCta')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin}>
          <label htmlFor={codeId} className="label">{t('onboard.inviteCode')}</label>
          <input
            id={codeId}
            className={`input font-mono tracking-wide ${errors.code ? 'input-error' : ''}`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (errors.code) setErrors((p) => ({ ...p, code: undefined }));
            }}
            placeholder="a1b2c3d4…"
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? `${codeId}-err` : undefined}
          />
          {errors.code && <p id={`${codeId}-err`} role="alert" className="text-sm font-semibold text-red-700 mt-1.5">{errors.code}</p>}
          <button className="btn-primary w-full mt-5" disabled={loading} aria-busy={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('onboard.joinCta')}
          </button>
        </form>
      )}
    </>
  );

  // In-app variant (reached from the nav): heading above, inside the app chrome.
  if (embedded) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 sm:py-10">
        <h1 className="heading text-[26px] text-fg mb-2 animate-rise">
          {t('nav.newHousehold')}
        </h1>
        <p className="text-mute text-[15px] mb-6 animate-rise [animation-delay:60ms]">{t('onboard.subtitle')}</p>
        <div className="card p-5 sm:p-7 animate-rise [animation-delay:120ms]">{tabsAndForm}</div>
      </div>
    );
  }

  return (
    <AuthShell title={t('onboard.title')} subtitle={t('onboard.subtitle')} showSignOut>
      {tabsAndForm}
    </AuthShell>
  );
}
