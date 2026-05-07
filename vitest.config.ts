import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
<<<<<<< Updated upstream
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
=======
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './lib/__tests__/mocks/server-only.ts'),
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['.next', 'node_modules', 'prisma'],
>>>>>>> Stashed changes
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
