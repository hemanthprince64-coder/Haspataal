import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';

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
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'scratch/**',
      'scripts/**',
      'tests/e2e/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.integration.test.ts',
      '**/*.spec.ts',
      'shannon/**',
      'bones/**',
      'node_modules/',
      '.next/',
      '.turbo/',
      'dist/',
      'out/',
      'build/',
      'coverage/',
      'generated/',
      'prisma/generated/',
      'graphify-out/',
      'scratch/',
      'tmp/',
      'downloads/',
      'next-env.d.ts',
      'haspataal-in/**',
      'haspataal-admin/**',
      'haspataal-com/**',
      'haspataal-mobile/**',
      'scripts/**',
      '.kilo/**',
    ],
  },
];
