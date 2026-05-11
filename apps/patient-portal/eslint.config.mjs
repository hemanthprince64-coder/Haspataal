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
      '@typescript-eslint': null,
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
      'no-console': 'error',
      'prefer-const': 'error',
      'no-throw-literal': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'local-rules/no-direct-prisma-in-pages': 'error',
      'local-rules/no-patient-data-in-logs': 'error',
    },
  },
  {
    files: ['lib/**/*.ts', 'app/actions.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
  {
    files: ['lib/services.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
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
    ],
  },
];
