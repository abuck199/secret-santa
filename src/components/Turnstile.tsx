'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import Script from 'next/script';
import { useI18n } from '@/i18n/client';

// Cloudflare's always-pass test site key for local dev; real keys are required
// on Vercel (next.config.ts checks).
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

// Cloudflare Turnstile bot check. Invisible unless Cloudflare needs a click
// ("interaction-only"). Calls onToken with a fresh single-use token, or null
// when it expires or fails; call reset() after each use to get a new one.
export default function Turnstile({ onToken, ref }: { onToken: (token: string | null) => void; ref?: Ref<TurnstileHandle> }) {
  const { lang } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenCallback = useRef(onToken);
  useEffect(() => {
    tokenCallback.current = onToken;
  }, [onToken]);

  const render = useCallback(() => {
    if (!box.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(box.current, {
      sitekey: SITE_KEY,
      appearance: 'interaction-only',
      size: 'flexible',
      language: lang,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      callback: (token: string) => tokenCallback.current(token),
      'expired-callback': () => tokenCallback.current(null),
      'error-callback': () => tokenCallback.current(null),
    });
  }, [lang]);

  // The script may already be loaded (another visit to this page).
  useEffect(() => {
    render();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [render]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      tokenCallback.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={render} />
      <div ref={box} className="mt-4 empty:mt-0" />
    </>
  );
}
