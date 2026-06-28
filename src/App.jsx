import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AuthView from './views/AuthView';
import ResetPasswordView from './views/ResetPasswordView';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import WishlistView from './views/WishlistView';
import MembersView from './views/MembersView';
import ReservationsView from './views/ReservationsView';
import AssignmentView from './views/AssignmentView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';
import FaqView from './views/FaqView';

const VIEW_KEY = 'wishly:view';
const KNOWN_VIEWS = [
  'dashboard',
  'wishlist',
  'members',
  'reservations',
  'assignment',
  'settings',
  'profile',
  'faq',
  'onboarding',
];

export default function App() {
  const { loading, session, recovery, hasHouseholds, currentHouseholdId } = useAuth();
  const [view, setViewState] = useState(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      return KNOWN_VIEWS.includes(saved) ? saved : 'dashboard';
    } catch (_) {
      return 'dashboard';
    }
  });

  const setView = (v) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch (_) {}
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Reset to dashboard when switching households.
  useEffect(() => {
    setViewState((v) => (v === 'onboarding' ? 'dashboard' : v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHouseholdId]);

  const toaster = (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '12px',
          background: 'rgb(var(--fg))',
          color: 'rgb(var(--paper))',
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 14px',
        },
        success: { iconTheme: { primary: 'rgb(var(--gold))', secondary: 'rgb(var(--paper))' } },
        error: { iconTheme: { primary: '#e5484d', secondary: 'rgb(var(--paper))' } },
      }}
    />
  );

  let content;
  if (recovery) {
    content = <ResetPasswordView />;
  } else if (loading) {
    content = <Loading />;
  } else if (!session) {
    content = <AuthView />;
  } else if (!hasHouseholds) {
    content = <OnboardingView />;
  } else {
    content = (
      <div className="min-h-screen bg-paper flex flex-col pb-24 md:pb-0">
        <NavBar view={view} setView={setView} />
        <main className="flex-1 w-full">
          {view === 'dashboard' && <DashboardView setView={setView} />}
          {view === 'wishlist' && <WishlistView />}
          {view === 'members' && <MembersView />}
          {view === 'reservations' && <ReservationsView setView={setView} />}
          {view === 'assignment' && <AssignmentView setView={setView} />}
          {view === 'settings' && <SettingsView setView={setView} />}
          {view === 'profile' && <ProfileView />}
          {view === 'faq' && <FaqView />}
          {view === 'onboarding' && (
            <OnboardingView embedded onDone={() => setView('dashboard')} />
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {toaster}
      {content}
    </>
  );
}
