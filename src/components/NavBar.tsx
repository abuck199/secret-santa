'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ClipboardList,
  Gift,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Plus,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { switchHousehold } from '@/server/actions/households';
import type { MyHousehold } from '@/server/queries/households';
import Brand from './Brand';
import LanguageToggle from './LanguageToggle';
import { useSignOut } from './useSignOut';

type Icon = ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' }>;

function initials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase();
}

export default function NavBar({
  name,
  households,
  current,
}: {
  name: string;
  households: MyHousehold[];
  current: MyHousehold;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const items: { label: string; icon: Icon; path: string }[] = [
    { label: t('nav.dashboard'), icon: Home, path: '/app' },
    { label: t('nav.wishlist'), icon: ClipboardList, path: '/app/list' },
    { label: t('nav.members'), icon: Users, path: '/app/members' },
    { label: t('nav.reservations'), icon: Gift, path: '/app/reservations' },
    ...(current.secretSantaEnabled ? [{ label: t('nav.assignment'), icon: Heart, path: '/app/match' }] : []),
  ];

  const isActive = (path: string) =>
    path === '/app' ? pathname === '/app' : pathname.startsWith(path);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) setSwitcherOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
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
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setSwitcherOpen(false);
  };

  async function pickHousehold(id: string) {
    closeAll();
    if (id === current.id) return;
    const res = await switchHousehold(id);
    if (!res.ok) return toast.error(actionErrorMessage(t, res));
    router.push('/app');
    router.refresh();
  }

  const switcher = (block: boolean) => (
    <div className={block ? '' : 'relative'} ref={block ? undefined : switcherRef}>
      <button
        onClick={() => setSwitcherOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={switcherOpen}
        aria-label={t('nav.switchHousehold')}
        className={`flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-fg hover:bg-panel-2 transition ${
          block ? 'w-full justify-between' : ''
        }`}
      >
        <span className="truncate max-w-[160px]">{current.name}</span>
        <ChevronDown className="w-4 h-4 text-mute" aria-hidden="true" />
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
              {h.id === current.id && <Check className="w-4 h-4 text-brand-ink shrink-0" />}
            </button>
          ))}
          <Link
            href="/app/new"
            onClick={closeAll}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-fg hover:bg-panel-2 font-medium mt-1 border-t border-line"
          >
            <Plus className="w-4 h-4 text-brand-ink" /> {t('nav.newHousehold')}
          </Link>
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
            <Link href="/app" aria-label={t('nav.dashboard')}>
              <Brand size="sm" />
            </Link>
            {switcher(false)}
          </div>

          <div className="flex items-center gap-0.5">
            {items.map(({ label, icon: Icon, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active ? 'text-fg' : 'text-mute hover:text-fg'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                  <span className="hidden lg:inline">{label}</span>
                  {active && (
                    <span aria-hidden="true" className="absolute -bottom-[1.35rem] left-2 right-2 h-0.5 bg-brand rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                aria-label={t('a11y.account')}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="w-9 h-9 rounded-full bg-fg text-paper text-sm font-semibold grid place-items-center hover:opacity-90 transition"
              >
                {initials(name)}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 card p-1.5 animate-scale-in z-50">
                  <div className="px-3 py-2.5 border-b border-line">
                    <p className="font-semibold text-fg truncate">{name}</p>
                    <p className="text-xs text-mute truncate">{current.name}</p>
                  </div>
                  <MenuRow icon={User} label={t('nav.profile')} href="/app/profile" onClick={closeAll} />
                  <MenuRow icon={Settings} label={t('nav.settings')} href="/app/settings" onClick={closeAll} />
                  <MenuRow icon={HelpCircle} label={t('nav.faq')} href="/app/help" onClick={closeAll} />
                  <div className="border-t border-line mt-1 pt-1">
                    <button
                      onClick={() => {
                        closeAll();
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
          <Link href="/app" aria-label={t('nav.dashboard')}>
            <Brand size="sm" showMark={false} />
          </Link>
          <span className="text-sm font-medium text-mute truncate max-w-[32vw]">{current.name}</span>
        </div>
      </nav>

      {/* ===== Mobile bottom bar ===== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-xl border-t border-line pb-safe">
        <div className="flex items-center justify-around px-2 py-1.5">
          {items.slice(0, 3).map(({ label, icon: Icon, path }) => (
            <Link
              key={path}
              href={path}
              aria-current={isActive(path) ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
                isActive(path) ? 'text-fg' : 'text-mute'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-mute"
          >
            <Menu className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
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
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-panel rounded-t-3xl shadow-card max-h-[85vh] overflow-y-auto animate-slide-up pb-safe border-t border-line"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <span className="font-display text-lg font-medium text-fg">{t('nav.menu')}</span>
              <button onClick={() => setMenuOpen(false)} aria-label={t('a11y.closeMenu')} className="text-mute">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-fg text-paper font-semibold grid place-items-center">
                  {initials(name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-fg truncate">{name}</p>
                  <p className="text-xs text-mute">
                    {current.role === 'admin' ? t('common.admin') : t('common.member')}
                  </p>
                </div>
                <div className="ml-auto">
                  <LanguageToggle />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute mb-2">
                  {t('nav.switchHousehold')}
                </p>
                {switcher(true)}
              </div>

              <div className="space-y-1">
                {items.map(({ label, icon, path }) => (
                  <SheetRow key={path} icon={icon} label={label} href={path} active={isActive(path)} onClick={closeAll} />
                ))}
                <SheetRow icon={User} label={t('nav.profile')} href="/app/profile" active={isActive('/app/profile')} onClick={closeAll} />
                <SheetRow icon={Settings} label={t('nav.settings')} href="/app/settings" active={isActive('/app/settings')} onClick={closeAll} />
                <SheetRow icon={HelpCircle} label={t('nav.faq')} href="/app/help" active={isActive('/app/help')} onClick={closeAll} />
              </div>

              <button
                onClick={() => {
                  closeAll();
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

function MenuRow({ icon: Icon, label, href, onClick }: { icon: Icon; label: string; href: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-fg hover:bg-panel-2"
    >
      <Icon className="w-4 h-4 text-mute" /> {label}
    </Link>
  );
}

function SheetRow({
  icon: Icon,
  label,
  href,
  active,
  onClick,
}: {
  icon: Icon;
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
        active ? 'bg-panel-2 text-fg' : 'text-mute hover:bg-panel-2 hover:text-fg'
      }`}
    >
      <Icon className="w-5 h-5" /> {label}
    </Link>
  );
}
