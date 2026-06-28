import React, { useState, useEffect, useRef } from 'react';
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

function useNavItems(secretSanta) {
  const { t } = useI18n();
  return [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { id: 'wishlist', label: t('nav.wishlist'), icon: ClipboardList },
    { id: 'members', label: t('nav.members'), icon: Users },
    { id: 'reservations', label: t('nav.reservations'), icon: Gift },
    ...(secretSanta ? [{ id: 'assignment', label: t('nav.assignment'), icon: Heart }] : []),
  ];
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase();
}

export default function NavBar({ view, setView }) {
  const { t } = useI18n();
  const { profile, currentHousehold, households, switchHousehold, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const profileRef = useRef(null);
  const switcherRef = useRef(null);

  const items = useNavItems(currentHousehold?.secret_santa_enabled);
  const name = profile?.display_name || '';

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

  const go = (id) => {
    setView(id);
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const pickHousehold = (id) => {
    switchHousehold(id);
    setSwitcherOpen(false);
    setMenuOpen(false);
    setView('dashboard');
  };

  const HouseholdSwitcher = ({ block }) => (
    <div className={block ? '' : 'relative'} ref={block ? undefined : switcherRef}>
      <button
        onClick={() => setSwitcherOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition ${
          block ? 'w-full justify-between' : ''
        }`}
      >
        <span className="truncate max-w-[160px]">{currentHousehold?.name || '—'}</span>
        <ChevronDown className="w-4 h-4 text-ink-400" />
      </button>
      {switcherOpen && (
        <div
          className={`${
            block ? 'mt-2' : 'absolute left-0 mt-2 w-64'
          } z-50 card p-1.5 animate-scale-in`}
        >
          {households.map((h) => (
            <button
              key={h.id}
              onClick={() => pickHousehold(h.id)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm hover:bg-ink-50 text-left"
            >
              <span className="truncate">{h.name}</span>
              {h.id === currentHousehold?.id && (
                <Check className="w-4 h-4 text-brand-600 shrink-0" />
              )}
            </button>
          ))}
          <button
            onClick={() => go('onboarding')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-700 hover:bg-brand-50 font-semibold mt-1 border-t border-ink-100"
          >
            <Plus className="w-4 h-4" /> {t('nav.newHousehold')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ===== Desktop ===== */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Brand size="sm" onClick={() => go('dashboard')} />
            <HouseholdSwitcher />
          </div>

          <div className="flex items-center gap-1">
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  view === id
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-bold grid place-items-center shadow-glow hover:scale-105 transition"
              >
                {initials(name)}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 card p-1.5 animate-scale-in z-50">
                  <div className="px-3 py-2.5 border-b border-ink-100">
                    <p className="font-bold text-ink-900 truncate">{name}</p>
                    <p className="text-xs text-ink-400 truncate">{currentHousehold?.name}</p>
                  </div>
                  <MenuRow icon={User} label={t('nav.profile')} onClick={() => go('profile')} />
                  <MenuRow icon={Settings} label={t('nav.settings')} onClick={() => go('settings')} />
                  <MenuRow icon={HelpCircle} label={t('nav.faq')} onClick={() => go('faq')} />
                  <div className="border-t border-ink-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-accent-600 hover:bg-accent-50"
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
      <nav className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-ink-200">
        <div className="px-4 h-14 flex items-center justify-between">
          <Brand size="sm" onClick={() => go('dashboard')} />
          <span className="text-sm font-semibold text-ink-500 truncate max-w-[40%]">
            {currentHousehold?.name}
          </span>
        </div>
      </nav>

      {/* ===== Mobile bottom bar ===== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-ink-200 pb-safe">
        <div className="flex items-center justify-around px-2 py-1.5">
          {[
            { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
            { id: 'wishlist', label: t('nav.wishlist'), icon: ClipboardList },
            { id: 'members', label: t('nav.members'), icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
                view === id ? 'text-brand-700' : 'text-ink-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-ink-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[11px] font-semibold">{t('nav.menu')}</span>
          </button>
        </div>
      </div>

      {/* ===== Mobile sheet ===== */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-card max-h-[85vh] overflow-y-auto animate-slide-up pb-safe">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <span className="font-bold text-ink-900">{t('nav.menu')}</span>
              <button onClick={() => setMenuOpen(false)} className="text-ink-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-gradient text-white font-bold grid place-items-center">
                  {initials(name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900 truncate">{name}</p>
                  <p className="text-xs text-ink-400">{t('common.member')}</p>
                </div>
                <div className="ml-auto">
                  <LanguageToggle />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">
                  {t('nav.switchHousehold')}
                </p>
                <HouseholdSwitcher block />
              </div>

              <div className="space-y-1">
                {items.map(({ id, label, icon: Icon }) => (
                  <SheetRow key={id} icon={Icon} label={label} active={view === id} onClick={() => go(id)} />
                ))}
                <SheetRow icon={User} label={t('nav.profile')} active={view === 'profile'} onClick={() => go('profile')} />
                <SheetRow icon={Settings} label={t('nav.settings')} active={view === 'settings'} onClick={() => go('settings')} />
                <SheetRow icon={HelpCircle} label={t('nav.faq')} active={view === 'faq'} onClick={() => go('faq')} />
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent-600 hover:bg-accent-50 font-semibold"
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
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-600 hover:bg-ink-50"
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function SheetRow({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${
        active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
      }`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );
}
