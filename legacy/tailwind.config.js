/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // --- Semantic tokens (premium/minimal). Driven by CSS vars so they
        // switch automatically between light and dark. ---
        paper: 'rgb(var(--paper) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        'panel-2': 'rgb(var(--panel-2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        mute: 'rgb(var(--mute) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        goldsoft: 'rgb(var(--goldsoft) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.03), 0 6px 20px rgb(0 0 0 / 0.04)',
        card: '0 1px 3px rgb(0 0 0 / 0.05), 0 14px 40px rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.97)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
