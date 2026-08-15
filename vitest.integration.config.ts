import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Integration tests use real infrastructure, so we don't mock Redis here.
    // They still need secrets for services to initialize correctly.
    env: {
      NEXTAUTH_SECRET: 'test-secret-for-jwt-signing-which-is-at-least-32-chars-long',
      JWT_SECRET: 'test-secret-for-jwt-signing-which-is-at-least-32-chars-long',
      DATABASE_URL: 'postgresql://postgres:Haspataal2026@localhost:5432/haspataal',
      DIRECT_URL: 'postgresql://postgres:Haspataal2026@localhost:5432/haspataal',
    },
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './lib/__tests__/mocks/server-only.ts'),
      '@haspataal/timeline': path.resolve(__dirname, './packages/timeline/src/index.ts'),
      '@haspataal/journey': path.resolve(__dirname, './packages/journey/src/index.ts'),
      '@haspataal/platform-contracts': path.resolve(
        __dirname,
        './packages/platform-contracts/src/index.ts',
      ),
      '@haspataal/events': path.resolve(__dirname, './packages/events/src/index.ts'),
      '@haspataal/search': path.resolve(__dirname, './packages/search/src/index.ts'),
      '@haspataal/notify': path.resolve(__dirname, './packages/notify/src/index.ts'),
      '@haspataal/db': path.resolve(__dirname, './packages/db/index.ts'),
    },
    include: ['**/*.integration.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'out/**',
      '**/out/**',
      '.next',
      'node_modules',
      'prisma',
      '.*/**',
      'shannon/**',
      'tests/smoke/**',
    ],
    // For integration tests, we want to allow longer timeouts for containers to start
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
