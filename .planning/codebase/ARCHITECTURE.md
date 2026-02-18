# Project Architecture

## Type
Monolithic Full-Stack Web Application (Next.js App Router)

## Layers
1.  **Presentation:** React Server Components (RSC) and Client Components in `app/`.
2.  **API Layer:** Next.js Route Handlers (`app/api/`) acting as the backend interface.
3.  **Data Access:** Prisma Client interacting with the database.
4.  **Service Layer:** Business logic encapsulated in `lib/services.js` (inference from previous edits).

## Data Flow
Client -> Server Component / API Route -> Service Layer -> Prisma -> Database
