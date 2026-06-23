---
trigger: always_on
description: Formatting with Prettier, code quality with ESLint, strict TypeScript, and pre-commit hooks via Husky.
---

## code-quality

Follow these rules for code quality:
- **Prettier**: All files must be formatted with Prettier before saving or committing.
- **ESLint**: Strict code quality rules apply. Fix all lint warnings and errors before committing.
- **TypeScript strict mode**: Ensure strict type checking is enabled (`"strict": true` in tsconfig.json files) and write type-safe code. Never use `any` unless absolutely necessary.
- **Husky & lint-staged**: Ensure pre-commit hooks are active to run auto-formatting and lint checking.
