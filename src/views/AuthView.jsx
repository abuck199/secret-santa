import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import * as api from '../lib/api';
import Brand from '../components/Brand';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';
import DatePicker from '../components/DatePicker';

export default function AuthView() {
  const { t } = useI18n();
  const [mode, setMode] = useState('signin'); // signin | signup | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(null);

  const [form, setForm] = useState({ email: '', password: '', displayName: '', birthday: '' });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  function readableError(err) {
    const msg = (err && err.message) || '';
    if (/invalid login credentials/i.test(msg)) return t('auth.invalidCreds');
    if (/already registered|already exists/i.test(msg)) return t('auth.haveAccount');
    return msg || t('err.generic');
  }

  async function handleSignIn(e) {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error(t('common.required'));
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
    if (!form.email || !form.password || !form.displayName.trim()) return toast.error(t('common.required'));
    if (form.password.length < 6) return toast.error(t('auth.passwordShort'));
    setLoading(true);
    try {
      const res = await api.signUp({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        birthday: form.birthday || null,
      });
      if (!res.session) setConfirmEmail(form.email.trim());
    } catch (err) {
      toast.error(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!form.email) return toast.error(t('common.required'));
    setLoading(true);
    try {
      await api.sendPasswordReset(form.email.trim());
      toast.success(t('auth.resetSent'));
      setMode('signin');
    } catch (err) {
      toast.error(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <AuthShell>
        <div className="text-center animate-scale-in">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-goldsoft text-gold grid place-items-center mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-medium text-fg mb-2">{t('auth.checkEmail')}</h2>
          <p className="text-mute text-sm mb-6 leading-relaxed">
            {t('auth.confirmSent', { email: confirmEmail })}
          </p>
          <button
            className="btn-secondary w-full"
            onClick={() => {
              setConfirmEmail(null);
              setMode('signin');
            }}
          >
            {t('auth.signin')}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      {mode === 'forgot' ? (
        <form onSubmit={handleForgot} className="animate-scale-in">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="flex items-center gap-1.5 text-sm text-mute hover:text-fg mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {t('common.back')}
          </button>
          <h2 className="font-serif text-xl font-medium text-fg mb-1">{t('auth.forgotTitle')}</h2>
          <p className="text-mute text-sm mb-5">{t('auth.forgotSubtitle')}</p>
          <Field icon={Mail} type="email" label={t('auth.email')} value={form.email} onChange={set('email')} autoComplete="email" />
          <button className="btn-primary w-full mt-5" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.sendReset')}
          </button>
        </form>
      ) : (
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="animate-scale-in">
          <div className="flex gap-1 p-1 bg-panel-2 rounded-xl mb-6">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  mode === m ? 'bg-panel text-fg shadow-soft' : 'text-mute'
                }`}
              >
                {m === 'signin' ? t('auth.signin') : t('auth.signup')}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <Field icon={User} label={t('auth.displayName')} value={form.displayName} onChange={set('displayName')} autoComplete="name" />
          )}

          <Field icon={Mail} type="email" label={t('auth.email')} value={form.email} onChange={set('email')} autoComplete="email" />

          <div className="mb-4">
            <label className="label">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="input pl-11 pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-fg"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="mb-4">
              <label className="label">{`${t('auth.birthday')} (${t('common.optional')})`}</label>
              <DatePicker
                value={form.birthday}
                onChange={(v) => setForm((p) => ({ ...p, birthday: v }))}
                placeholder={t('auth.birthday')}
              />
            </div>
          )}

          {mode === 'signin' && (
            <div className="text-right -mt-1 mb-3">
              <button type="button" onClick={() => setMode('forgot')} className="text-sm link">
                {t('auth.forgot')}
              </button>
            </div>
          )}

          <button className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'signin' ? (
              t('auth.signinCta')
            ) : (
              t('auth.signupCta')
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function AuthShell({ children }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-7">
          <Brand size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg">{t('auth.welcome')}</h1>
            <p className="text-mute text-sm mt-1.5">{t('auth.subtitle')}</p>
          </div>
          {children}
        </div>
        <p className="text-center text-xs text-mute mt-6">{t('app.tagline')}</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = 'text', ...props }) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" />}
        <input type={type} className={`input ${Icon ? 'pl-11' : ''}`} {...props} />
      </div>
    </div>
  );
}
