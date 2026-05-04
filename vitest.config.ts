import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts', 'scripts/tests/**/*.test.ts'],
    exclude: [
      '**/.git/**',
      '**/.kilo/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/haspataal-in/**',
    ],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
      },
    },
  },
});
