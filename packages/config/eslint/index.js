/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@next/next/no-html-link-for-pages': 'off',
  },
  ignorePatterns: ['node_modules/', '.next/', 'dist/', 'build/'],
};
