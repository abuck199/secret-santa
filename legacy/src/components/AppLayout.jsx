import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import NavBar from './NavBar';
import Footer from './Footer';

const TITLE_KEYS = {
  '/app': 'nav.dashboard',
  '/app/list': 'nav.wishlist',
  '/app/members': 'nav.members',
  '/app/reservations': 'nav.reservations',
  '/app/match': 'nav.assignment',
  '/app/settings': 'nav.settings',
  '/app/profile': 'nav.profile',
  '/app/help': 'nav.faq',
  '/app/new': 'nav.newHousehold',
};

export default function AppLayout() {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const key = TITLE_KEYS[location.pathname];
    document.title = key ? `${t(key)} · ThatWish` : 'ThatWish';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, t]);

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-24 md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-fg focus:text-paper focus:shadow-card focus:text-sm focus:font-medium"
      >
        {t('a11y.skip')}
      </a>
      <NavBar />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
