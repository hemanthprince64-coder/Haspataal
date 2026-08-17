import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import localRules from 'eslint-plugin-local-rules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      'local-rules': localRules,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      'local-rules/no-direct-prisma-in-pages': 'error',
      'local-rules/no-patient-data-in-logs': 'error',
      'react/no-unescaped-entities': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      // Operational services intentionally use console output until logging is
      // centralized; do not turn existing warnings into a release blocker.
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      '**/scratch/**',
      '**/scripts/**',
      '**/tests/e2e/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.integration.test.ts',
      '**/*.spec.ts',
      '**/shannon/**',
      '**/bones/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/out/**',
      '**/build/**',
      '**/coverage/**',
      '**/generated/**',
      '**/prisma/generated/**',
      '**/graphify-out/**',
      '**/tmp/**',
      '**/downloads/**',
      '**/next-env.d.ts',
      '**/haspataal-in/**',
      '**/haspataal-admin/**',
      '**/haspataal-com/**',
      '**/haspataal-mobile/**',
      '**/.kilo/**',
    ],
  },
];
