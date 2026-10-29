'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

// Dark rounded toast near the bottom (where the thumb and eyes already are on
// a phone), above the tab bar. Success uses the "this is yours" yellow.
export default function Toaster() {
  return (
    <HotToaster
      position="bottom-center"
      containerStyle={{ bottom: 'calc(6.5rem + env(safe-area-inset-bottom))' }}
      toastOptions={{
        style: {
          borderRadius: '20px',
          background: 'rgb(var(--fg))',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: 1.35,
          padding: '12px 16px',
          maxWidth: '420px',
        },
        success: { iconTheme: { primary: 'rgb(var(--sun))', secondary: 'rgb(var(--fg))' } },
        error: { iconTheme: { primary: '#f06a6f', secondary: 'rgb(var(--fg))' } },
      }}
    />
  );
}
