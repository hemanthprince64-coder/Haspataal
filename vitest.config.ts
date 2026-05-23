import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './lib/__tests__/mocks/server-only.ts'),
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['.next', 'node_modules', 'prisma'],
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
