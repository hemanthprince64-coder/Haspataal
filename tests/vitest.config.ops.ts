import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [path.resolve(__dirname, '../vitest.setup.ts')],
    alias: {
      '@': path.resolve(__dirname, '../apps/hospital-hms'),
    },
    include: ['tests/unit/hospital-operations.test.ts'],
  },
});
