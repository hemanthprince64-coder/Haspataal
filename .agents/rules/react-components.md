---
trigger: always_on
description: Use react:components for stitch-to-react component transformations.
---

## react:components

Use this skill when converting UI designs/mockups into modular Vite/React components. Follow [react-components SKILL.md](file:///C:/Users/heman/.gemini/config/skills/react-components/SKILL.md).

Rules:
- Transform Stitch designs into modular, clean, type-safe React/Vite components.
- Isolate logic in custom hooks under `src/hooks/` and decouple mock data under `src/data/mockData.ts`.
- Every component must have a Readonly interface for its Props.
- Sync Tailwind styles with `resources/style-guide.json` and use theme-mapped classes.
