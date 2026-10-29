// Light/dark theme. The choice lives in localStorage (same key as the old app,
// so returning users keep it); without one we follow the OS.

type Theme = 'light' | 'dark';

const THEME_KEY = 'thatwish:theme';

// Inlined in <head> by the root layout so the right theme is applied before
// the first paint (no flash of the wrong theme). Keep it tiny and ES5.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){}})();`;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
