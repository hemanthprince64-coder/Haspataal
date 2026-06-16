import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@/hooks': path.resolve(__dirname, '../../hooks'),
      '@/services': path.resolve(__dirname, '../../services'),
      '@haspataal/types': path.resolve(__dirname, '../../packages/types'),
      '@haspataal/db': path.resolve(__dirname, '../../packages/db'),
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './lib/__tests__/mocks/server-only.ts'),
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '.next'],
  },
});
