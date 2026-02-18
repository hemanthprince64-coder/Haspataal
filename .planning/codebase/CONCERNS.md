# Concerns & Technical Debt

## High Priority
- **Hardcoded Data:** `lib/data.js` contains mock data. Needs migration to real DB.
- **Inline Styles:** Heavy use of inline styles in `page.js` makes maintenance hard. Should move to CSS modules or Tailwind classes.
- **No Tests:** Lack of automated testing poses regression risks.

## Medium Priority
- **JavaScript vs TypeScript:** Project is in JS; migrating to TS would improve maintainability.
- **Magic Strings:** Hardcoded colors and values in components.
