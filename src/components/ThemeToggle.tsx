'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { applyTheme } from './theme';

// The theme is whatever class the init script put on <html>; watch it rather
// than duplicating it in React state.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
const isDarkNow = () => document.documentElement.classList.contains('dark');

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const isDark = useSyncExternalStore(subscribe, isDarkNow, () => false);
  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? t('a11y.toLight') : t('a11y.toDark')}
      className={`grid place-items-center w-9 h-9 rounded-full border border-line text-mute hover:text-fg hover:bg-panel-2 transition ${className}`}
    >
      {isDark ? (
        <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
