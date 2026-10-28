import React, { useEffect, useState, useId } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { usePublicSeo, parsePublicPath, localizedPath } from '../lib/seo';
import * as api from '../lib/api';
import Brand from '../components/Brand';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';
import DatePicker from '../components/DatePicker';

export default function AuthView({ initialMode = 'signin', onBack }) {
  const { t, lang } = useI18n();
  usePublicSeo();
  const navigate = useNavigate();
  const location = useLocation();
  const urlLang = parsePublicPath(location.pathname).fr ? 'fr' : 'en';

  const [mode, setMode] = useState(initialMode); // signin | signup | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', birthday: '' });
  const [errors, setErrors] = useState({});
  const pwId = useId();
  const pwErrId = `${pwId}-err`;
  const bdayLabelId = useId();
  const bdayErrId = useId();

  // Keep the form in sync with the route (/login vs /signup) and reset errors.
  useEffect(() => {
    setMode(initialMode);
    setErrors({});
  }, [initialMode]);

  const set = (k) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((p) => ({ ...p, [k]: value }));
    setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p));
  };

  const switchMode = (m) => {
    setErrors({});
    setMode(m);
  };

  function readableError(err) {
    const msg = (err && err.message) || '';
    if (/invalid login credentials/i.test(msg)) return t('auth.invalidCreds');
    if (/already registered|already exists/i.test(msg)) return t('auth.haveAccount');
    return msg || t('err.generic');
  }

  async function handleSignIn(e) {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = t('common.required');
    if (!form.password) errs.password = t('common.required');
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      await api.signIn({ email: form.email.trim(), password: form.password });
    } catch (err) {
      toast.error(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    const errs = {};
    if (!form.displayName.trim()) errs.displayName = t('common.required');
    if (!form.email.trim()) errs.email = t('common.required');
    if (!form.password) errs.password = t('common.required');
    else if (form.password.length < 6) errs.password = t('auth.passwordShort');
    if (!form.birthday) errs.birthday = t('common.required');
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const res = await api.signUp({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        birthday: form.birthday,
        lang,
      });
      if (!res.session) setConfirmEmail(form.email.trim());
    } catch (err) {
      toast.error(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await api.signInWithGoogle(); // navigates away to Google on success
    } catch (err) {
      toast.error(readableError(err));
      setLoading(false); // only reached if the redirect failed to start
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!form.email.trim()) return setErrors({ email: t('common.required') });
    setLoading(true);
    try {
      await api.sendPasswordReset(form.email.trim());
      toast.success(t('auth.resetSent'));
      switchMode('signin');
    } catch (err) {
      toast.error(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <AuthShell onBack={onBack} hideHeader>
        <div className="text-center animate-scale-in">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-goldsoft text-gold grid place-items-center mb-4">
            <Mail className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-xl font-medium text-fg mb-2">{t('auth.checkEmail')}</h2>
          <p className="text-mute text-sm mb-6 leading-relaxed">
            {t('auth.confirmSent', { email: confirmEmail })}
          </p>
          <button
            className="btn-secondary w-full"
            onClick={() => {
              setConfirmEmail(null);
              switchMode('signin');
            }}
          >
            {t('auth.signin')}
          </button>
        </div>
      </AuthShell>
    );
  }

  if (mode === 'forgot') {
    return (
      <AuthShell onBack={onBack} hideHeader>
        <form onSubmit={handleForgot} className="animate-scale-in">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="flex items-center gap-1.5 text-sm text-mute hover:text-fg mb-5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('auth.signin')}
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-goldsoft text-gold grid place-items-center mb-4">
              <KeyRound className="w-6 h-6" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h2 className="font-serif text-xl font-medium text-fg">{t('auth.forgotTitle')}</h2>
            <p className="text-mute text-sm mt-1.5 leading-relaxed">{t('auth.forgotSubtitle')}</p>
          </div>

          <Field
            icon={Mail}
            type="email"
            label={t('auth.email')}
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            error={errors.email}
          />

          <button
            className="btn-primary w-full mt-1"
            disabled={loading}
            aria-busy={loading}
            aria-label={t('auth.sendReset')}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('auth.sendReset')}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell onBack={onBack}>
      <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="animate-scale-in">
        <div className="flex gap-1 p-1 bg-panel-2 rounded-xl mb-6">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => navigate(localizedPath(m === 'signin' ? '/login' : '/signup', urlLang))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === m ? 'bg-panel text-fg shadow-soft' : 'text-mute'
              }`}
            >
              {m === 'signin' ? t('auth.signin') : t('auth.signup')}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="btn-secondary w-full mb-4"
          aria-label={t('auth.continueGoogle')}
        >
          <GoogleIcon className="w-5 h-5" />
          {t('auth.continueGoogle')}
        </button>

        <div className="flex items-center gap-3 mb-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-mute">{t('auth.or')}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {mode === 'signup' && (
          <Field
            icon={User}
            label={t('auth.displayName')}
            value={form.displayName}
            onChange={set('displayName')}
            autoComplete="name"
            placeholder={t('auth.namePlaceholder')}
            error={errors.displayName}
          />
        )}

        <Field
          icon={Mail}
          type="email"
          label={t('auth.email')}
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          error={errors.email}
        />

        <div className="mb-4">
          <label htmlFor={pwId} className="label">{t('auth.password')}</label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                errors.password ? 'text-red-500' : 'text-mute'
              }`}
            />
            <input
              id={pwId}
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? pwErrId : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t('a11y.hidePassword') : t('a11y.showPassword')}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-fg"
            >
              {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && <p id={pwErrId} className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
        </div>

        {mode === 'signup' && (
          <div className="mb-4">
            <label id={bdayLabelId} className="label">{t('auth.birthday')}</label>
            <DatePicker
              value={form.birthday}
              onChange={set('birthday')}
              placeholder={t('auth.birthday')}
              invalid={!!errors.birthday}
              ariaLabelledby={bdayLabelId}
              ariaDescribedby={errors.birthday ? bdayErrId : undefined}
            />
            {errors.birthday && <p id={bdayErrId} className="text-xs text-red-500 mt-1.5">{errors.birthday}</p>}
          </div>
        )}

        {mode === 'signin' && (
          <div className="text-right -mt-1 mb-3">
            <button type="button" onClick={() => switchMode('forgot')} className="text-sm link">
              {t('auth.forgot')}
            </button>
          </div>
        )}

        <button
          className="btn-primary w-full mt-2"
          disabled={loading}
          aria-busy={loading}
          aria-label={mode === 'signin' ? t('auth.signinCta') : t('auth.signupCta')}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : mode === 'signin' ? (
            t('auth.signinCta')
          ) : (
            t('auth.signupCta')
          )}
        </button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ children, onBack, hideHeader }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center px-4 pt-14 sm:pt-20 pb-12">
      <main id="main-content" className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-7">
          <Brand size="md" onClick={onBack} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          {!hideHeader && (
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-medium tracking-tight text-fg">{t('auth.welcome')}</h1>
              <p className="text-mute text-sm mt-1.5">{t('auth.subtitle')}</p>
            </div>
          )}
          {children}
        </div>
        <p className="text-center text-xs text-mute mt-6">{t('app.tagline')}</p>
      </main>
    </div>
  );
}

// Google's official four-color "G" mark.
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function Field({ icon: Icon, label, type = 'text', error, ...props }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              error ? 'text-red-500' : 'text-mute'
            }`}
          />
        )}
        <input
          id={id}
          type={type}
          className={`input ${Icon ? 'pl-11' : ''} ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          {...props}
        />
      </div>
      {error && <p id={errId} className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
