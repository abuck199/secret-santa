'use client';

import { useId, useLayoutEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Loader2, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from '@/components/DatePicker';
import LanguageToggle from '@/components/LanguageToggle';
import PageHeader, { Page } from '@/components/PageHeader';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { updateProfile } from '@/server/actions/profile';
import type { MyProfile } from '@/server/queries/profile';
import DeleteAccountDialog from './delete-account-dialog';

export default function ProfileForm({ profile }: { profile: MyProfile }) {
  const { t } = useI18n();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [birthday, setBirthday] = useState(profile.birthday ?? '');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Cache Components keeps this page mounted (hidden) after navigating away:
  // don't come back to a half-finished deletion dialog.
  useLayoutEffect(() => () => setDeleteOpen(false), []);

  const nameId = useId();
  const bdayLabelId = useId();
  const bdayHintId = useId();

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return toast.error(t('common.required'));
    setSaving(true);
    const res = await updateProfile({ displayName: displayName.trim(), birthday });
    setSaving(false);
    if (!res.ok) return toast.error(actionErrorMessage(t, res));
    toast.success(t('profile.saved'));
    router.refresh(); // nav initials, dashboard greeting, birthdays
  }

  return (
    <Page>
      <PageHeader title={t('profile.title')} />

      <form onSubmit={saveProfile} className="card p-5 mb-4 animate-rise [animation-delay:60ms]">
        {/* Who you are, as others see you: updates live while typing. */}
        <div className="flex items-center gap-3.5 mb-5">
          <span
            aria-hidden="true"
            className="w-16 h-16 shrink-0 rounded-full bg-brand text-white grid place-items-center font-display font-black text-2xl"
          >
            {(displayName.trim()[0] || '?').toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="heading text-xl text-fg truncate">{displayName.trim() || '…'}</p>
            <p className="text-sm text-mute truncate mt-1">{profile.email}</p>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor={nameId} className="label">{t('profile.displayName')}</label>
          <input
            id={nameId}
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            placeholder={t('auth.namePlaceholder')}
          />
        </div>
        <div className="mb-2">
          <label id={bdayLabelId} className="label">{t('profile.birthday')}</label>
          <DatePicker
            value={birthday}
            onChange={setBirthday}
            placeholder={t('profile.birthday')}
            ariaLabelledby={bdayLabelId}
            ariaDescribedby={bdayHintId}
          />
          <p id={bdayHintId} className="text-sm text-mute mt-1.5">{t('profile.birthdayHint')}</p>
        </div>
        <button className="btn-primary w-full sm:w-auto mt-4" disabled={saving} aria-busy={saving}>
          {saving ? (
            <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-[18px] h-[18px]" aria-hidden="true" />
          )}
          {t('common.save')}
        </button>
      </form>

      <div className="card p-5 mb-4 flex items-center justify-between gap-4 animate-rise [animation-delay:120ms]">
        <h2 className="heading text-lg text-fg flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-ink" aria-hidden="true" /> {t('profile.language')}
        </h2>
        <LanguageToggle />
      </div>

      {/* Law 25: people can delete their account themselves. */}
      <div className="card p-5 animate-rise [animation-delay:180ms]">
        <h2 className="heading text-lg text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" aria-hidden="true" /> {t('profile.dangerZone')}
        </h2>
        <p className="text-[15px] text-mute mb-4 leading-relaxed">{t('profile.deleteAccountDesc')}</p>
        <button className="btn-danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-[18px] h-[18px]" aria-hidden="true" />
          {t('profile.deleteAccount')}
        </button>
      </div>

      {deleteOpen && <DeleteAccountDialog email={profile.email} onClose={() => setDeleteOpen(false)} />}
    </Page>
  );
}
