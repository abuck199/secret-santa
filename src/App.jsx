import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useI18n } from './i18n/I18nContext';
import { localizedPath } from './lib/seo';
import Loading from './components/Loading';
import AppLayout from './components/AppLayout';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import ResetPasswordView from './views/ResetPasswordView';
import OnboardingView from './views/OnboardingView';
import JoinRoute from './views/JoinRoute';
import DashboardView from './views/DashboardView';
import WishlistView from './views/WishlistView';
import MembersView from './views/MembersView';
import ReservationsView from './views/ReservationsView';
import AssignmentView from './views/AssignmentView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';
import FaqView from './views/FaqView';

function LandingRoute() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  return (
    <LandingView
      onSignIn={() => navigate(localizedPath('/login', lang))}
      onGetStarted={() => navigate(localizedPath('/signup', lang))}
    />
  );
}

function AuthRoute({ mode }) {
  const navigate = useNavigate();
  const { lang } = useI18n();
  return <AuthView initialMode={mode} onBack={() => navigate(localizedPath('/', lang))} />;
}

// Forces French for a /fr route on direct visits (deep links, crawlers).
function Localized({ lang, children }) {
  const { setLang } = useI18n();
  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);
  return children;
}

// Authenticated boundary: send users with no household to onboarding,
// otherwise render the app chrome with nested routes.
function AppGuard() {
  const { hasHouseholds } = useAuth();
  if (!hasHouseholds) return <OnboardingView />;
  return <AppLayout />;
}

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

export default function App() {
  const { loading, session, recovery } = useAuth();

  let content;
  if (recovery) {
    content = <ResetPasswordView />;
  } else if (loading) {
    content = <Loading />;
  } else {
    content = (
      <Routes>
        <Route path="/" element={session ? <Navigate to="/app" replace /> : <LandingRoute />} />
        <Route
          path="/fr"
          element={session ? <Navigate to="/app" replace /> : <Localized lang="fr"><LandingRoute /></Localized>}
        />
        <Route path="/login" element={session ? <Navigate to="/app" replace /> : <AuthRoute mode="signin" />} />
        <Route
          path="/fr/login"
          element={session ? <Navigate to="/app" replace /> : <Localized lang="fr"><AuthRoute mode="signin" /></Localized>}
        />
        <Route path="/signup" element={session ? <Navigate to="/app" replace /> : <AuthRoute mode="signup" />} />
        <Route
          path="/fr/signup"
          element={session ? <Navigate to="/app" replace /> : <Localized lang="fr"><AuthRoute mode="signup" /></Localized>}
        />
        <Route path="/join/:code" element={<JoinRoute />} />

        <Route path="/app" element={session ? <AppGuard /> : <Navigate to="/" replace />}>
          <Route index element={<DashboardView />} />
          <Route path="list" element={<WishlistView />} />
          <Route path="members" element={<MembersView />} />
          <Route path="reservations" element={<ReservationsView />} />
          <Route path="match" element={<AssignmentView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="help" element={<FaqView />} />
          <Route path="new" element={<OnboardingView embedded />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {toaster}
      {content}
    </>
  );
}
