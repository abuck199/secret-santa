import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Users,
  Gift,
  Heart,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

function useNavItems(secretSanta) {
  const { t } = useI18n();
  return [
    { label: t('nav.dashboard'), icon: Home, path: '/app' },
    { label: t('nav.wishlist'), icon: ClipboardList, path: '/app/list' },
    { label: t('nav.members'), icon: Users, path: '/app/members' },
    { label: t('nav.reservations'), icon: Gift, path: '/app/reservations' },
    ...(secretSanta ? [{ label: t('nav.assignment'), icon: Heart, path: '/app/match' }] : []),
  ];
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase();
}

export default function NavBar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, currentHousehold, households, switchHousehold, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const profileRef = useRef(null);
  const switcherRef = useRef(null);

  const items = useNavItems(currentHousehold?.secret_santa_enabled);
  const name = profile?.display_name || '';

  const isActive = (path) =>
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setSwitcherOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setSwitcherOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const pickHousehold = (id) => {
    switchHousehold(id);
    setSwitcherOpen(false);
    setMenuOpen(false);
    navigate('/app');
  };

  const HouseholdSwitcher = ({ block }) => (
    <div className={block ? '' : 'relative'} ref={block ? undefined : switcherRef}>
      <button
        onClick={() => setSwitcherOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-fg hover:bg-panel-2 transition ${
          block ? 'w-full justify-between' : ''
        }`}
      >
        <span className="truncate max-w-[160px]">{currentHousehold?.name || ''}</span>
        <ChevronDown className="w-4 h-4 text-mute" />
      </button>
      {switcherOpen && (
        <div className={`${block ? 'mt-2' : 'absolute left-0 mt-2 w-64'} z-50 card p-1.5 animate-scale-in`}>
          {households.map((h) => (
            <button
              key={h.id}
              onClick={() => pickHousehold(h.id)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm hover:bg-panel-2 text-left text-fg"
            >
              <span className="truncate">{h.name}</span>
              {h.id === currentHousehold?.id && <Check className="w-4 h-4 text-gold shrink-0" />}
            </button>
          ))}
          <button
            onClick={() => go('/app/new')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg hover:bg-panel-2 font-medium mt-1 border-t border-line"
          >
            <Plus className="w-4 h-4 text-gold" /> {t('nav.newHousehold')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ===== Desktop ===== */}
      <nav className="hidden md:block sticky top-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Brand size="sm" onClick={() => go('/app')} />
            <HouseholdSwitcher />
          </div>

          <div className="flex items-center gap-0.5">
            {items.map(({ label, icon: Icon, path }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active ? 'text-fg' : 'text-mute hover:text-fg'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.9} />
                  <span className="hidden lg:inline">{label}</span>
                  {active && (
                    <span className="absolute -bottom-[1.35rem] left-2 right-2 h-0.5 bg-gold rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-fg text-paper text-sm font-semibold grid place-items-center hover:opacity-90 transition"
              >
                {initials(name)}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 card p-1.5 animate-scale-in z-50">
                  <div className="px-3 py-2.5 border-b border-line">
                    <p className="font-semibold text-fg truncate">{name}</p>
                    <p className="text-xs text-mute truncate">{currentHousehold?.name}</p>
                  </div>
                  <MenuRow icon={User} label={t('nav.profile')} onClick={() => go('/app/profile')} />
                  <MenuRow icon={Settings} label={t('nav.settings')} onClick={() => go('/app/settings')} />
                  <MenuRow icon={HelpCircle} label={t('nav.faq')} onClick={() => go('/app/help')} />
                  <div className="border-t border-line mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" /> {t('auth.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Mobile top ===== */}
      <nav className="md:hidden sticky top-0 z-40 bg-paper/85 backdrop-blur-xl border-b border-line">
        <div className="px-4 h-14 flex items-center justify-between">
          <Brand size="sm" onClick={() => go('/app')} showMark={false} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-sm font-medium text-mute truncate max-w-[32vw]">
              {currentHousehold?.name}
            </span>
          </div>
        </div>
      </nav>

      {/* ===== Mobile bottom bar ===== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-xl border-t border-line pb-safe">
        <div className="flex items-center justify-around px-2 py-1.5">
          {[
            { label: t('nav.dashboard'), icon: Home, path: '/app' },
            { label: t('nav.wishlist'), icon: ClipboardList, path: '/app/list' },
            { label: t('nav.members'), icon: Users, path: '/app/members' },
          ].map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
                isActive(path) ? 'text-fg' : 'text-mute'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.9} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-mute"
          >
            <Menu className="w-5 h-5" strokeWidth={1.9} />
            <span className="text-[11px] font-medium">{t('nav.menu')}</span>
          </button>
        </div>
      </div>

      {/* ===== Mobile sheet ===== */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-panel rounded-t-3xl shadow-card max-h-[85vh] overflow-y-auto animate-slide-up pb-safe border-t border-line">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <span className="font-serif text-lg font-medium text-fg">{t('nav.menu')}</span>
              <button onClick={() => setMenuOpen(false)} className="text-mute">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-fg text-paper font-semibold grid place-items-center">
                  {initials(name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-fg truncate">{name}</p>
                  <p className="text-xs text-mute">{t('common.member')}</p>
                </div>
                <div className="ml-auto">
                  <LanguageToggle />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute mb-2">
                  {t('nav.switchHousehold')}
                </p>
                <HouseholdSwitcher block />
              </div>

              <div className="space-y-1">
                {items.map(({ label, icon: Icon, path }) => (
                  <SheetRow key={path} icon={Icon} label={label} active={isActive(path)} onClick={() => go(path)} />
                ))}
                <SheetRow icon={User} label={t('nav.profile')} active={isActive('/app/profile')} onClick={() => go('/app/profile')} />
                <SheetRow icon={Settings} label={t('nav.settings')} active={isActive('/app/settings')} onClick={() => go('/app/settings')} />
                <SheetRow icon={HelpCircle} label={t('nav.faq')} active={isActive('/app/help')} onClick={() => go('/app/help')} />
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-500/10 font-medium"
              >
                <LogOut className="w-5 h-5" /> {t('auth.signOut')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MenuRow({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-fg hover:bg-panel-2"
    >
      <Icon className="w-4 h-4 text-mute" /> {label}
    </button>
  );
}

function SheetRow({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
        active ? 'bg-panel-2 text-fg' : 'text-mute hover:bg-panel-2 hover:text-fg'
      }`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );
}
