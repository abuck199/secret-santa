'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

// Same look as the old app: inverted pill that follows the theme tokens.
export default function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '12px',
          background: 'rgb(var(--fg))',
          color: 'rgb(var(--paper))',
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 14px',
        },
        success: { iconTheme: { primary: 'rgb(var(--gold))', secondary: 'rgb(var(--paper))' } },
        error: { iconTheme: { primary: '#e5484d', secondary: 'rgb(var(--paper))' } },
      }}
    />
  );
}
