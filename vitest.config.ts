import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["lib/**/*.spec.ts"],
    exclude: [
      "**/.git/**",
      "**/.kilo/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/haspataal-in/**",
    ],
  },
});
