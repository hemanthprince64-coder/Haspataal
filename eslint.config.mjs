import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/generated/**",
    // Sub-project directories (each has its own lint config)
    "haspataal-in/**",
    "haspataal-admin/**",
    "haspataal-com/**",
    "haspataal-mobile/**",
    "scripts/**",
    ".kilo/**",
  ]),
]);

export default eslintConfig;
