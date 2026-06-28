import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'wishly:lang';
const SUPPORTED = ['en', 'fr'];

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch (_) {}
  // Default to French; users can switch with the EN/FR toggle (choice is saved).
  return 'fr';
}

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
    if (typeof document !== 'undefined') document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key, vars) => {
      const table = translations[lang] || translations.en;
      let str = table[key];
      if (str == null) str = (translations.en && translations.en[key]) || key;
      if (vars) {
        str = str.replace(/\{(\w+)\}/g, (m, name) =>
          vars[name] != null ? String(vars[name]) : m
        );
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export default I18nContext;
