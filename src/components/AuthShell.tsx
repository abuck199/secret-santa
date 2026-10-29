'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import Brand from './Brand';
import LanguageToggle from './LanguageToggle';
import { useSignOut } from './useSignOut';

// The narrow centered card shared by sign-in, "complete your profile" and
// onboarding, so they feel like one family.
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  showSignOut = false,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showSignOut?: boolean;
}) {
  const { t } = useI18n();
  const signOut = useSignOut();
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center px-4 pt-8 sm:pt-16 pb-12">
      <main id="main-content" className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6 animate-rise">
          <Link href="/" aria-label={t('legal.home')}>
            <Brand size="md" />
          </Link>
          <LanguageToggle />
        </div>
        <div className="card p-5 sm:p-7 animate-rise [animation-delay:80ms]">
          {title && (
            <div className="mb-6">
              <h1 className="heading text-[26px] text-fg">{title}</h1>
              {subtitle && <p className="text-mute text-[15px] mt-2 leading-relaxed">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
        {footer}
        {showSignOut ? (
          <button
            onClick={signOut}
            className="mx-auto mt-5 flex items-center gap-2 min-h-11 px-3 text-[15px] font-semibold text-mute hover:text-fg"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" /> {t('auth.signOut')}
          </button>
        ) : (
          <p className="text-center text-sm text-mute mt-6">{t('app.tagline')}</p>
        )}
      </main>
    </div>
  );
}
