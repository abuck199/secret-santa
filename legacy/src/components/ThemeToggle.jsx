import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
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
