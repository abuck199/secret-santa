import React, { useState, useId } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import Brand from '../components/Brand';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';
import DatePicker from '../components/DatePicker';

// Shown to signed-in users who don't have a birthday yet - chiefly people who
// signed up with Google (which never gives us a birthday). Keeps the mandatory
// birthday rule for everyone without blocking social sign-up at the database.
// Layout mirrors the onboarding / auth shell so it feels like the same family.
export default function CompleteProfileView() {
  const { t } = useI18n();
  const { profile, user, refreshProfile, signOut } = useAuth();

  // Prefill the name from the existing profile, then Google's metadata.
  const meta = user?.user_metadata || {};
  const initialName =
    profile?.display_name || meta.full_name || meta.name || '';

  const [name, setName] = useState(initialName);
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nameId = useId();
  const bdayLabelId = useId();
  const bdayErrId = useId();
  const bdayHintId = useId();

  async function handleSave(e) {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = t('common.required');
    if (!birthday) errs.birthday = t('common.required');
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await api.updateProfile({ display_name: name.trim(), birthday });
      await refreshProfile(); // birthday now set → the gate falls through to the app
      toast.success(t('complete.saved'));
    } catch (err) {
      toast.error(t('err.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center px-4 pt-14 sm:pt-20 pb-12">
      <main id="main-content" className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-7">
          <Brand size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        <div className="card p-6 sm:p-8 animate-scale-in">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg">{t('complete.title')}</h1>
            <p className="text-mute text-sm mt-1.5">{t('complete.subtitle')}</p>
          </div>

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

            <button className="btn-primary w-full mt-5" disabled={loading} aria-busy={loading} aria-label={t('complete.cta')}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('complete.cta')}
            </button>
          </form>
        </div>

        <button
          onClick={signOut}
          className="mx-auto mt-6 flex items-center gap-2 text-sm text-mute hover:text-fg"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" /> {t('auth.signOut')}
        </button>
      </main>
    </div>
  );
}
