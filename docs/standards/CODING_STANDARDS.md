---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# Coding Standards

## 1. Naming & Syntax
- **Naming:** `PascalCase` for Components, `camelCase` for variables, `kebab-case` for folder names.
- **Imports:** Use absolute paths (e.g., `@/components/...`).
- **Data Attributes:** Use `data-*` attributes for E2E testing (e.g., `data-testid="submit-btn"`).

## 2. Forms & Inputs
- **Mobile Keyboards:** Use `inputMode="numeric"` or `"tel"` alongside `type="number/tel"` to ensure proper virtual keyboards on mobile devices.
- **Hydration:** Use `suppressHydrationWarning` on inputs to prevent browser extensions from causing mismatches.

## 3. Server Actions
- Files marked with `"use server"` must ONLY export `async` functions. Runtime values like Zod schema objects must be moved to a separate file (e.g., `lib/validations.ts`).
- Cast `formData.get()` results explicitly (e.g., `as string` or `as File`) for strict TypeScript checking.
- Return typed `ActionResult` schemas, catching errors with `withErrorMonitoring`.

## 4. Design & Layout
- Use `.tsx` for all dashboard components.
- Use Tailwind CSS over inline styles.
- Navigation: Bottom Navigation bars exclusively for mobile (`md:hidden`); Top Navigation bar or persistent Sidebar for desktop screens (≥768px).
- **Touch Targets:** Use the `.touch-target` global class (`min-h-[44px] min-w-[44px] p-2.5`) on interactive elements to enforce WCAG 2.5.8.
