import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [path.resolve(__dirname, './vitest.setup.ts')],
    env: {
      NEXTAUTH_SECRET: 'test-secret-for-jwt-signing-which-is-at-least-32-chars-long',
      DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy',
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
    include: ['**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '.next',
      'node_modules',
      'prisma',
      '.*/**',
      'shannon/**',
      'tests/smoke/**',
      '**/*.integration.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
  },
});
