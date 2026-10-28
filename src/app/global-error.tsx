'use client';

// Last resort when the root layout itself fails (no translations, theme or
// fonts available then), so: plain markup, both languages, inline styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f6f4ef', color: '#1e1c19' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center' }}>
          <div style={{ maxWidth: 360 }}>
            <p style={{ fontSize: 48, margin: 0, color: '#8a6321' }}>500</p>
            <h1 style={{ fontSize: 20 }}>Something went wrong · Une erreur s’est produite</h1>
            <p style={{ fontSize: 14, color: '#6f6960' }}>
              Try again in a moment. · Réessayez dans un instant.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: 16, padding: '10px 16px', borderRadius: 12, border: 0, background: '#1e1c19', color: '#f6f4ef', cursor: 'pointer' }}
            >
              Try again · Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
