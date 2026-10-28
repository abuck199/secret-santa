'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { updateProfile } from '@/server/actions/profile';
import AuthShell from './AuthShell';
import DatePicker from './DatePicker';

// First stop after a first sign-in: name and birthday are mandatory (the old
// sign-up form asked for them; the email-code flow doesn't).
export default function CompleteProfile({
  initialName,
  initialBirthday,
}: {
  initialName: string;
  initialBirthday: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [birthday, setBirthday] = useState(initialBirthday ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; birthday?: string }>({});
  const nameId = useId();
  const bdayLabelId = useId();
  const bdayErrId = useId();
  const bdayHintId = useId();

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = t('common.required');
    if (!birthday) errs.birthday = t('common.required');
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    const res = await updateProfile({ displayName: name.trim(), birthday });
    if (!res.ok) {
      setLoading(false);
      return toast.error(actionErrorMessage(t, res));
    }
    toast.success(t('complete.saved'));
    // On to the app (which sends them to /start if they have no household).
    router.replace('/app');
    router.refresh();
  }

  return (
    <AuthShell title={t('complete.title')} subtitle={t('complete.subtitle')} showSignOut>
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label htmlFor={nameId} className="label">{t('auth.displayName')}</label>
          <input
            id={nameId}
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            autoComplete="name"
            autoFocus
            maxLength={60}
            placeholder={t('auth.namePlaceholder')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${nameId}-err` : undefined}
          />
          {errors.name && <p id={`${nameId}-err`} className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
        </div>

        <div className="mb-2">
          <label id={bdayLabelId} className="label">{t('auth.birthday')}</label>
          <DatePicker
            value={birthday}
            onChange={(v) => {
              setBirthday(v);
              if (errors.birthday) setErrors((p) => ({ ...p, birthday: undefined }));
            }}
            placeholder={t('auth.birthday')}
            invalid={!!errors.birthday}
            ariaLabelledby={bdayLabelId}
            ariaDescribedby={errors.birthday ? bdayErrId : bdayHintId}
          />
          {errors.birthday ? (
            <p id={bdayErrId} className="text-xs text-red-500 mt-1.5">{errors.birthday}</p>
          ) : (
            <p id={bdayHintId} className="text-xs text-mute mt-1.5">{t('profile.birthdayHint')}</p>
          )}
        </div>

        <button className="btn-primary w-full mt-5" disabled={loading} aria-busy={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('complete.cta')}
        </button>
      </form>
    </AuthShell>
  );
}
