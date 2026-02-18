# Project State

**Current Phase:** Phase 2 (Data & Infrastructure)
**Last Action:** GSD Codebase Mapping (`map-codebase`)
**Status:** Ready for Database Migration

## Recent Decisions
- Reverted Hero Section to centered layout with custom SVG illustration.
- Adopted Next.js App Router and Server Components.
- Selected Prisma as ORM.

## Active Blockers
- **Tech Debt:** Application runs on mock data; cannot scale or persist changes.
- **Testing:** No unit or integration tests exist; regression risk is high.

## Immediate Next Steps
1.  Design Database Schema (`schema.prisma`).
2.  Set up local database (Docker or SQLite for dev).
3.  Rewrite `lib/services.js` to use Prisma Client.
