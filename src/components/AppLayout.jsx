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
    document.title = key ? `${t(key)} · Wishly` : 'Wishly';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, t]);

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-24 md:pb-0">
      <NavBar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
