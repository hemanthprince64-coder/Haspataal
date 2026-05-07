import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export const baseConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "no-console": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
]);

export default baseConfig;
