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

// The "+ Ajouter" tab: the wishlist page focuses its add field on this hash.
export const ADD_FIELD_ID = 'add';
const ADD_ITEM_HREF = `/app/list#${ADD_FIELD_ID}`;

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
  const [accountOpen, setAccountOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const items: { label: string; icon: Icon; path: string }[] = [
    { label: t('nav.dashboard'), icon: Home, path: '/app' },
    { label: t('nav.wishlist'), icon: ClipboardList, path: '/app/list' },
    { label: t('nav.members'), icon: Users, path: '/app/members' },
    { label: t('nav.gifts'), icon: Gift, path: '/app/reservations' },
    ...(current.secretSantaEnabled ? [{ label: t('nav.assignment'), icon: Heart, path: '/app/match' }] : []),
  ];
  // Phones: 2 tabs, the add button, 2 tabs. The Secret Santa page is reached
  // from the home screen and the account menu.
  const [home, list, members, gifts] = items;

  const isActive = (path: string) =>
    path === '/app' ? pathname === '/app' : pathname.startsWith(path);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
      if (switcherRef.current && !switcherRef.current.contains(target)) setSwitcherOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountOpen(false);
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // The account menu is a full sheet on phones: keep the page from scrolling behind it.
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)').matches;
    document.body.style.overflow = accountOpen && phone ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [accountOpen]);

  const closeAll = () => {
    setAccountOpen(false);
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

  const accountLinks: { label: string; icon: Icon; href: string }[] = [
    ...(current.secretSantaEnabled ? [{ label: t('nav.assignment'), icon: Heart, href: '/app/match' }] : []),
    { label: t('nav.profile'), icon: User, href: '/app/profile' },
    { label: t('nav.settings'), icon: Settings, href: '/app/settings' },
    { label: t('nav.faq'), icon: HelpCircle, href: '/app/help' },
  ];

  return (
    <>
      {/* ===== Top bar (all sizes) =====
          Solid background on purpose: a backdrop-filter would become the
          containing block of the account sheet's position: fixed. */}
      <nav className="sticky top-0 z-40 bg-paper">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/app" aria-label={t('nav.dashboard')} className="hidden md:block shrink-0">
              <Brand size="sm" />
            </Link>

            {/* Household switcher */}
            <div className="relative min-w-0" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={switcherOpen}
                aria-label={`${t('nav.switchHousehold')}: ${current.name}`}
                className="press flex items-center gap-2 h-11 max-w-full pl-1.5 pr-3.5 rounded-full bg-panel shadow-soft text-[15px] font-semibold text-fg"
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 shrink-0 rounded-full bg-sun grid place-items-center font-display font-black text-xs"
                >
                  {initials(current.name)}
                </span>
                <span className="truncate">{current.name}</span>
                <ChevronDown className="w-4 h-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
              </button>
              {switcherOpen && (
                <div className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] z-50 card shadow-card p-2 animate-scale-in">
                  {households.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => pickHousehold(h.id)}
                      className="w-full min-h-12 flex items-center justify-between gap-2 px-3 rounded-2xl text-base hover:bg-panel-2 text-left text-fg"
                    >
                      <span className="truncate">{h.name}</span>
                      {h.id === current.id && <Check className="w-5 h-5 text-brand-ink shrink-0" aria-hidden="true" />}
                    </button>
                  ))}
                  <Link
                    href="/app/new"
                    onClick={closeAll}
                    className="w-full min-h-12 flex items-center gap-2 px-3 rounded-2xl text-base text-fg hover:bg-panel-2 font-semibold mt-1 border-t border-line"
                  >
                    <Plus className="w-5 h-5 text-brand-ink" aria-hidden="true" /> {t('nav.newHousehold')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {items.map(({ label, icon: Icon, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  aria-current={active ? 'page' : undefined}
                  className={`press flex items-center gap-2 h-10 px-3.5 rounded-full text-sm font-semibold transition-colors ${
                    active ? 'bg-sun text-fg' : 'text-mute hover:text-fg hover:bg-panel'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} aria-hidden="true" />
                  <span className="hidden lg:inline">{label}</span>
                  <span className="lg:hidden sr-only">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Account menu: dropdown on desktop, bottom sheet on phones */}
          <div className="relative shrink-0" ref={accountRef}>
            <button
              onClick={() => setAccountOpen((o) => !o)}
              aria-label={t('a11y.account')}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              className="press w-11 h-11 rounded-full bg-brand text-white font-display font-black text-base grid place-items-center"
            >
              {initials(name)}
            </button>
            {accountOpen && (
              <>
                <div className="md:hidden fixed inset-0 z-40 bg-fg/50 animate-fade-in" onClick={closeAll} />
                <div
                  role="dialog"
                  aria-label={t('a11y.account')}
                  className="fixed md:absolute inset-x-0 bottom-0 md:left-auto md:bottom-auto md:mt-2 md:w-72 z-50
                    bg-panel rounded-t-[28px] md:rounded-3xl shadow-card px-4 pt-3 pb-safe md:p-2
                    animate-sheet md:animate-scale-in max-h-[85vh] overflow-y-auto"
                >
                  <span aria-hidden="true" className="md:hidden block w-11 h-1.5 rounded-full bg-line mx-auto mb-3" />
                  <div className="flex items-center gap-3 px-2 py-3 border-b border-line">
                    <span
                      aria-hidden="true"
                      className="w-11 h-11 shrink-0 rounded-full bg-brand text-white font-display font-black text-base grid place-items-center"
                    >
                      {initials(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base text-fg truncate">{name}</p>
                      <p className="text-sm text-mute truncate">
                        {current.name} · {current.role === 'admin' ? t('common.admin') : t('common.member')}
                      </p>
                    </div>
                    <button
                      onClick={closeAll}
                      aria-label={t('a11y.closeMenu')}
                      className="md:hidden w-11 h-11 grid place-items-center rounded-full text-mute hover:bg-panel-2"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="py-2">
                    {accountLinks.map(({ label, icon: Icon, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={closeAll}
                        aria-current={isActive(href) ? 'page' : undefined}
                        className="w-full min-h-12 md:min-h-11 flex items-center gap-3 px-3 rounded-2xl text-[15px] font-semibold text-fg hover:bg-panel-2"
                      >
                        <Icon className="w-5 h-5 text-mute" strokeWidth={2.2} aria-hidden="true" /> {label}
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-3 border-t border-line">
                    <span className="text-[15px] font-semibold text-fg">{t('a11y.language')}</span>
                    <LanguageToggle />
                  </div>
                  <button
                    onClick={() => {
                      closeAll();
                      signOut();
                    }}
                    className="w-full min-h-12 md:min-h-11 mb-3 md:mb-0 flex items-center gap-3 px-3 rounded-2xl text-[15px] font-semibold text-red-700 hover:bg-red-500/10 border-t border-line"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" /> {t('auth.signOut')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Phone bottom bar ===== */}
      <nav
        aria-label={t('nav.menu')}
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-panel rounded-t-3xl shadow-bar pb-safe"
      >
        <div className="grid grid-cols-5 gap-1 px-2 pt-2">
          <Tab {...home} active={isActive(home.path)} />
          <Tab {...list} active={isActive(list.path)} />
          <Link
            href={ADD_ITEM_HREF}
            onClick={(e) => {
              // Already on the list: a same-page hash change triggers nothing, so focus the field here.
              if (pathname !== '/app/list') return;
              e.preventDefault();
              const field = document.getElementById(ADD_FIELD_ID);
              field?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              field?.focus({ preventScroll: true });
            }}
            className="flex flex-col items-center justify-end gap-0.5 min-h-[52px] pb-1 text-xs font-bold text-fg"
          >
            <span className="press -mt-6 w-[52px] h-[52px] rounded-full bg-fg text-white grid place-items-center border-4 border-paper">
              <Plus className="w-6 h-6" strokeWidth={2.6} aria-hidden="true" />
            </span>
            {t('common.add')}
          </Link>
          <Tab {...members} active={isActive(members.path)} />
          <Tab {...gifts} active={isActive(gifts.path)} />
        </div>
      </nav>
    </>
  );
}

function Tab({ label, icon: Icon, path, active }: { label: string; icon: Icon; path: string; active: boolean }) {
  return (
    <Link
      href={path}
      aria-current={active ? 'page' : undefined}
      className={`press flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-2xl text-xs leading-tight text-center transition-colors ${
        active ? 'bg-paper text-fg font-bold' : 'text-mute font-semibold'
      }`}
    >
      <Icon className="w-[22px] h-[22px]" strokeWidth={2.2} aria-hidden="true" />
      {label}
    </Link>
  );
}
