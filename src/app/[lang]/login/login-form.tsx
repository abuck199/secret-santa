'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, KeyRound, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '@/components/AuthShell';
import Turnstile, { type TurnstileHandle } from '@/components/Turnstile';
import { useI18n } from '@/i18n/client';
import { authClient } from '@/lib/auth-client';

const RESEND_COOLDOWN = 30; // seconds
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only same-site paths, so ?next= can't bounce people to another site.
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/app';
}

export default function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // Bot check token for the next code request (single-use).
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const emailId = useId();
  const codeId = useId();

  // Cache Components keeps this page mounted but hidden after we navigate
  // away. A one-time code must never come back (it would even auto-submit), so
  // drop back to the email step whenever the page is hidden. The email stays.
  useLayoutEffect(() => {
    return () => {
      setStep('email');
      setCode('');
      setError('');
      setLoading(false);
      setCooldown(0);
      setCaptchaToken(null);
    };
  }, []);

  // Already signed in (e.g. back button): go straight to the app.
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data) router.replace(next);
    });
  }, [router, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return setError(t('auth.invalidEmail'));
    if (!captchaToken) return void toast(t('auth.captchaPending'));
    setLoading(true);
    setError('');
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email: clean,
      type: 'sign-in',
      fetchOptions: { headers: { 'x-captcha-response': captchaToken } },
    });
    setLoading(false);
    turnstile.current?.reset(); // a token works once
    if (err) {
      if (err.code === 'VERIFICATION_FAILED' || err.code === 'MISSING_RESPONSE') toast.error(t('auth.captchaFailed'));
      else toast.error(err.status === 429 ? t('auth.tooManyRequests') : t('err.generic'));
      return;
    }
    setEmail(clean);
    setCode('');
    setStep('code');
    setCooldown(RESEND_COOLDOWN);
  }

  async function verify(otp: string) {
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setError('');
    const { error: err } = await authClient.signIn.emailOtp({ email, otp });
    if (err) {
      setLoading(false);
      setCode('');
      if (err.code === 'OTP_EXPIRED') setError(t('auth.codeExpired'));
      else if (err.code === 'TOO_MANY_ATTEMPTS') setError(t('auth.tooManyAttempts'));
      else if (err.status === 429) setError(t('auth.tooManyRequests'));
      else setError(t('auth.invalidCode'));
      return;
    }
    // Keep the spinner: the app takes over (profile/onboarding gates included).
    router.replace(next);
    router.refresh();
  }

  const legal = (
    <p className="text-center text-xs text-mute mt-5 leading-relaxed">
      {t('auth.agree')}{' '}
      <Link href="/terms" className="link">{t('legal.terms')}</Link>
      {' · '}
      <Link href="/privacy" className="link">{t('legal.privacy')}</Link>
    </p>
  );

  if (step === 'code') {
    return (
      <AuthShell>
        <div className="animate-scale-in">
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setError('');
            }}
            className="flex items-center gap-1.5 text-sm text-mute hover:text-fg mb-5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('auth.changeEmail')}
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-goldsoft text-gold grid place-items-center mb-4">
              <KeyRound className="w-6 h-6" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h1 className="font-serif text-xl font-medium text-fg">{t('auth.codeLabel')}</h1>
            <p className="text-mute text-sm mt-1.5 leading-relaxed break-words">
              {t('auth.codeSent', { email })}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(code);
            }}
          >
            <label htmlFor={codeId} className="sr-only">{t('auth.codeLabel')}</label>
            <input
              id={codeId}
              className={`input text-center font-mono text-2xl tracking-[0.5em] ${error ? 'input-error' : ''}`}
              value={code}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(digits);
                if (error) setError('');
                // Submit as soon as the 6th digit lands (also covers paste and
                // the iOS/Android one-time-code autofill).
                if (digits.length === 6) verify(digits);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="••••••"
              aria-invalid={!!error}
              aria-describedby={error ? `${codeId}-err` : undefined}
              disabled={loading}
            />
            {error && <p id={`${codeId}-err`} className="text-xs text-red-500 mt-1.5 text-center">{error}</p>}

            <button
              className="btn-primary w-full mt-5"
              disabled={loading || code.length !== 6}
              aria-busy={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('auth.verify')}
            </button>
          </form>

          <button
            type="button"
            onClick={() => sendCode()}
            disabled={cooldown > 0 || loading || !captchaToken}
            className="w-full mt-3 text-sm text-mute hover:text-fg disabled:hover:text-mute disabled:cursor-not-allowed tabular-nums"
          >
            {cooldown > 0 ? t('auth.resendIn', { s: cooldown }) : t('auth.resend')}
          </button>
          {/* A fresh token for "send a new code". */}
          <Turnstile ref={turnstile} onToken={setCaptchaToken} />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.welcome')} subtitle={t('auth.subtitle')} footer={legal}>
      <form onSubmit={sendCode} noValidate>
        <label htmlFor={emailId} className="label">{t('auth.email')}</label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${error ? 'text-red-500' : 'text-mute'}`}
          />
          <input
            id={emailId}
            type="email"
            className={`input pl-11 ${error ? 'input-error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            autoComplete="email"
            autoFocus
            placeholder={t('auth.emailPlaceholder')}
            aria-invalid={!!error}
            aria-describedby={error ? `${emailId}-err` : `${emailId}-hint`}
          />
        </div>
        {error ? (
          <p id={`${emailId}-err`} className="text-xs text-red-500 mt-1.5">{error}</p>
        ) : (
          <p id={`${emailId}-hint`} className="text-xs text-mute mt-1.5">{t('auth.otpHint')}</p>
        )}

        <Turnstile ref={turnstile} onToken={setCaptchaToken} />

        <button className="btn-primary w-full mt-5" disabled={loading || !captchaToken} aria-busy={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : t('auth.sendCode')}
        </button>
        {!captchaToken && !loading && (
          <p className="text-xs text-mute mt-2 text-center" aria-live="polite">{t('auth.captchaPending')}</p>
        )}
      </form>
    </AuthShell>
  );
}
