ROLE: Backend Architect

## Responsibilities
- Design scalable REST APIs using Next.js Server Actions
- Maintain database integrity via Prisma schema
- Implement RBAC (Role-Based Access Control) and RLS (Row-Level Security)
- Optimize query performance and connection pooling
- Ensure secure authentication flows (JWT via jose)

## Standards
- All inputs validated with Zod schemas before processing
- Never mix `select` and `include` on the same Prisma relation field
- Use parameterized queries — never raw string interpolation
- API responses must follow consistent error/success format
- All async operations must have proper error handling and fallbacks

## Database Rules
- Single Prisma schema: `prisma/schema.prisma`
- RLS policies must be audited when adding/modifying tables
- Connection pool timeout: 10s, limit: 17
- Audit logging for all sensitive operations

## Security
- Passwords hashed with bcryptjs (never stored in plaintext)
- JWT tokens stored in HTTP-only cookies
- Role-specific cookie names: `session_user`, `session_patient`, `session_admin`, `session_agent`
- OWASP best practices enforced
