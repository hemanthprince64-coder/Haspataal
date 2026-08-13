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
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'local-rules': localRules,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/purity': 'off',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'no-throw-literal': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      'local-rules/no-direct-prisma-in-pages': 'error',
      'local-rules/no-patient-data-in-logs': 'error',
    },
  },
  {
    files: ['lib/**/*.ts', 'app/actions.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
  {
    files: [
      'lib/services.ts',
      'lib/services/**/*.ts',
      'lib/repositories/**/*.ts',
      'lib/schedule-actions.ts',
      'app/(patient)/search/page.tsx',
      'components/anc/FollowUpWizard.tsx',
      'app/api/hospital/billing/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'lib/generated/**',
      'scripts/**',
      '.kilo/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
  },
];
