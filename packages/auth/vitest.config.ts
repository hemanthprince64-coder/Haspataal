import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Exclude DB integration tests — they require a live DATABASE_URL.
    // Run them separately in CI with a real Postgres database.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    // Test-only environment variables.
    // These values are ONLY used in the Vitest environment and are not secrets.
    env: {
      CSRF_SECRET: 'vitest-test-secret-not-for-production-use-12345',
    },
    // server-only alias: scoped to this test environment ONLY.
    //
    // Why: session.ts imports 'server-only' (a Next.js compile-time sentinel
    // that prevents client-side bundle inclusion). This makes Vitest fail when
    // tests import modules that transitively import session.ts.
    //
    // Safety: This alias only affects Vitest. The Next.js production bundler
    // is completely unaffected; it continues enforcing the server-only boundary.
    // No client component can import server-only code in production.
    alias: {
      'server-only': path.resolve(__dirname, '__tests__/__mocks__/server-only.ts'),
    },
  },
});
