# ADR-003: Choosing Supabase over Self-Hosted PostgreSQL

## Status

**Accepted** — In production

## Context

Haspataal needed a PostgreSQL database solution that satisfies:

1. **Multi-tenancy**: Row-Level Security for hospital data isolation.
2. **Managed infrastructure**: Small founding team, no dedicated DBA.
3. **Real-time capabilities**: Future live dashboards (bed availability, queue status).
4. **Auth integration**: JWT-based authentication that RLS policies can consume.
5. **File storage**: Patient profile photos, prescription images, medical documents.
6. **Cost-efficiency**: Healthcare B2B2C startup with limited initial capital.
7. **Indian data residency**: Data should ideally reside in or near India.

## Decision

Use **Supabase** (hosted PostgreSQL) as the primary database platform.

### Why Supabase

| Capability             | Benefit for Haspataal                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Built-in RLS**       | JWT claims (`request.jwt.claims`) available in SQL policies without custom middleware |
| **Connection Pooling** | PgBouncer built-in (port 6543), essential for serverless Next.js deployments          |
| **Storage**            | Supabase Storage for patient photos, prescriptions — no separate S3 setup             |
| **Auth**               | Supabase Auth available as fallback, though we use custom jose-based JWT              |
| **Dashboard**          | SQL editor, table viewer, and RLS policy tester — reduces DBA tooling needs           |
| **Free tier**          | Sufficient for development and early production (500MB database, 1GB storage)         |

### Connection Strategy

```
Direct Connection (port 5432):  Used in local development for reliability
PgBouncer Pooler (port 6543):   Used in production for connection pooling
```

> **Known issue**: PgBouncer is intermittently unreachable in local dev. The `DATABASE_URL` falls back to direct connection (port 5432) when the pooler times out. See CLAUDE.md: "Supabase Connectivity Optimization".

## Alternatives Considered

| Alternative                         | Why Rejected                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Self-hosted PostgreSQL (Docker)** | Requires DBA expertise for backups, upgrades, connection pooling, monitoring. Team doesn't have one.      |
| **AWS RDS PostgreSQL**              | No built-in RLS JWT integration. Higher cost at startup stage. No free tier for PostgreSQL.               |
| **PlanetScale (MySQL)**             | MySQL lacks native RLS. Would require application-level tenant isolation only.                            |
| **CockroachDB**                     | Global distribution not needed. Higher complexity for a single-region India deployment.                   |
| **Neon**                            | Strong contender. Lacks built-in storage and the RLS JWT claim integration that Supabase provides.        |
| **MongoDB Atlas**                   | Document model doesn't fit relational healthcare data (appointments → doctors → hospitals → departments). |

## Consequences

### Positive

- **Zero infrastructure management**: No PostgreSQL upgrades, no backup scripts, no connection pool tuning.
- **RLS + JWT integration**: Policies directly parse JWT claims — no middleware needed.
- **Rapid iteration**: Supabase Dashboard SQL editor enables quick schema exploration and policy testing.
- **Built-in storage**: Profile photos and prescription images stored without additional S3/CloudFront setup.

### Negative

- **Vendor lock-in**: Supabase-specific JWT claim parsing (`request.jwt.claims`) in RLS policies. Migration to self-hosted PostgreSQL would require replacing this with `current_setting('app.hospital_id')` pattern.
- **Connection limits**: Free/Pro tier has limited connections. Prisma's connection pool must be configured carefully (max 5-10 in serverless, with `?pgbouncer=true`).
- **No Indian data center**: Supabase's nearest region is Singapore (ap-southeast-1). True Indian data residency requires self-hosting or waiting for Supabase to launch an India region.
- **Cost scaling**: Beyond the free tier, costs scale per-project. Multiple environments (staging, production) multiply costs.
- **Prisma compatibility**: Some Prisma features (interactive transactions in PgBouncer mode) require direct connection URL. The `directUrl` field in `schema.prisma` mitigates this.

## Migration Path

If we outgrow Supabase:

1. Export PostgreSQL dump via `pg_dump`
2. Replace `request.jwt.claims` in RLS policies with `current_setting('app.hospital_id')` (already used in application code)
3. Set up PgBouncer separately
4. Move file storage to S3 + CloudFront
5. Replace Supabase Auth (if used) with our existing jose-based JWT system (already the primary auth)

## References

- [prisma/schema.prisma](../../prisma/schema.prisma) — `directUrl` configuration
- [CLAUDE.md](../../CLAUDE.md) — "Supabase Connectivity Optimization" entry
- [lib/prisma.ts](../../lib/prisma.ts) — Connection pool configuration
