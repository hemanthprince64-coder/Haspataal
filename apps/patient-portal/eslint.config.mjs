import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import localRules from "eslint-plugin-local-rules";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      "local-rules": localRules,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // ── Default Next/React Overrides ──────────────────────────
      "react/no-unescaped-entities": "off",
      "react-hooks/purity": "off",

      // ── Strict Healthcare Safety Rules ────────────────────────
      "no-console": "error",
      "prefer-const": "error",
      "no-throw-literal": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // ── Custom Healthcare Anti-Patterns ───────────────────────
      "local-rules/no-direct-prisma-in-pages": "error",
      "local-rules/no-patient-data-in-logs": "error",
    },
  },
  {
    // Apply explicit return types only to core logic files
    files: ["lib/**/*.ts", "app/actions.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/generated/**",
    "scripts/**",
    ".kilo/**",
  ]),
]);

export default eslintConfig;
