'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import Brand from './Brand';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
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
    <div className="min-h-screen bg-paper flex flex-col items-center px-4 pt-14 sm:pt-20 pb-12">
      <main id="main-content" className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-7">
          <Link href="/" aria-label={t('legal.home')}>
            <Brand size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="card p-6 sm:p-8 animate-scale-in">
          {title && (
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-medium tracking-tight text-fg">{title}</h1>
              {subtitle && <p className="text-mute text-sm mt-1.5">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
        {footer}
        {showSignOut ? (
          <button
            onClick={signOut}
            className="mx-auto mt-6 flex items-center gap-2 text-sm text-mute hover:text-fg"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" /> {t('auth.signOut')}
          </button>
        ) : (
          <p className="text-center text-xs text-mute mt-6">{t('app.tagline')}</p>
        )}
      </main>
    </div>
  );
}
