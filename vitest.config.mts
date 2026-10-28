import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Server-side tests: the real Server Actions and queries against an in-memory
// Postgres (PGlite) built from drizzle/ migrations. Never touches Neon.
export default defineConfig({
  resolve: {
    alias: {
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
      // `import 'server-only'` throws outside Next's server bundles.
      'server-only': fileURLToPath(new URL('./tests/stubs/empty.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
