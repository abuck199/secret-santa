'use client';

// Last resort when the root layout itself fails (no translations, styles or
// fonts available then), so: plain markup, both languages, inline styles in
// the site's colours.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f7f2e8', color: '#1a1a1a' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center' }}>
          <div style={{ maxWidth: 360 }}>
            <p style={{ fontSize: 56, fontWeight: 900, margin: 0, color: '#c43c6a' }}>500</p>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Something went wrong · Une erreur s’est produite</h1>
            <p style={{ fontSize: 16, color: '#6b6355', lineHeight: 1.5 }}>
              Try again in a moment. · Réessayez dans un instant.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: 16,
                minHeight: 44,
                padding: '0 22px',
                borderRadius: 999,
                border: 0,
                background: '#1a1a1a',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again · Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
