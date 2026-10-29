'use client';

import { useId, useLayoutEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Loader2, Save, Sun, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from '@/components/DatePicker';
import LanguageToggle from '@/components/LanguageToggle';
import PageHeader, { Page } from '@/components/PageHeader';
import ThemeToggle from '@/components/ThemeToggle';
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
      <PageHeader eyebrow={t('nav.profile')} title={t('profile.title')} />

      <form onSubmit={saveProfile} className="card p-5 mb-4">
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
          <p id={bdayHintId} className="text-xs text-mute mt-1.5">{t('profile.birthdayHint')}</p>
        </div>
        <div className="flex items-center justify-between gap-3 mt-4">
          <p className="text-xs text-mute truncate">{profile.email}</p>
          <button className="btn-primary" disabled={saving} aria-busy={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            {t('common.save')}
          </button>
        </div>
      </form>

      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-lg font-medium text-fg flex items-center gap-2">
            <Sun className="w-[18px] h-[18px] text-gold" aria-hidden="true" /> {t('profile.language')}
          </h2>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-line">
          <span className="text-sm text-mute flex items-center gap-2">
            <Globe className="w-4 h-4" aria-hidden="true" /> {t('lang.label')}
          </span>
          <LanguageToggle />
        </div>
      </div>

      {/* Law 25: people can delete their account themselves. */}
      <div className="card p-5 border-red-500/30">
        <h2 className="font-serif text-lg font-medium text-fg mb-2 flex items-center gap-2">
          <Trash2 className="w-[18px] h-[18px] text-red-600" aria-hidden="true" /> {t('profile.dangerZone')}
        </h2>
        <p className="text-sm text-mute mb-4 leading-relaxed">{t('profile.deleteAccountDesc')}</p>
        <button className="btn-danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          {t('profile.deleteAccount')}
        </button>
      </div>

      {deleteOpen && <DeleteAccountDialog email={profile.email} onClose={() => setDeleteOpen(false)} />}
    </Page>
  );
}
