import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts", "scripts/tests/**/*.test.ts"],
    exclude: [
      "**/.git/**",
      "**/.kilo/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/haspataal-in/**",
    ],
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
      },
    },
  },
});
