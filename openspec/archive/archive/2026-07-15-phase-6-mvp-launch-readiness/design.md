## Context

Haspataal has completed Phase 0 through Phase 5B implementation (event foundation, canonical patient registry, clinical orders, pharmacy, laboratory, radiology, procedure, bloodbank, referral, authorization backbone, clinical timeline). The codebase is mature with:

- DDD-based `packages/core` with 40+ domain actions
- PostgreSQL RLS enforced tenant isolation
- BullMQ transactional outbox with DLQ
- JWT auth with role-specific cookies (jose)
- Pino structured logging with PHI redaction
- Prometheus metrics in gateway + auth services
- Sentry error tracking
- Docker Compose for production
- GitHub Actions CI/CD with schema safety gates
- Playwright E2E + Vitest + Testcontainers test infrastructure

However, no systematic production readiness validation has been performed. Security controls are implemented but unaudited for production. Performance has not been benchmarked. Reliability (replay, recovery) has not been verified at scale. Monitoring exists but lacks Grafana dashboards and comprehensive alerting. Hospital workflows have not been validated end-to-end. Billing accuracy has not been verified. Load testing has not been performed.

This phase closes all gaps to achieve production readiness within the 3-month MVP timeline.

## Goals / Non-Goals

**Goals:**
- Complete production security audit with OWASP Top 10, RBAC, RLS, DPDP, PHI encryption verification
- Benchmark and optimize all P0 workflows to meet latency targets
- Verify outbox replay, consumer recovery, idempotency, and crash safety
- Deploy OpenTelemetry, Prometheus, Grafana dashboards, structured logs, health endpoints
- Validate complete hospital workflow (reception → discharge → follow-up) for usability and safety
- Verify every clinical event generates correct billing events
- Validate Docker images, CI/CD, zero-downtime deployment, backup/restore, disaster recovery
- Generate complete operational documentation suite
- Run realistic load testing (500 concurrent users, 100 OPDs, 1M outbox events)
- Execute complete regression suite across all prior phases
- Produce Launch Readiness Report with Go/No-Go recommendation

**Non-Goals:**
- No new bounded contexts (unless blocking P0 hospital workflow)
- No canonical architecture changes
- No platform vs hospital boundary changes
- No PHI/privacy rule changes without explicit approval
- No destructive schema migrations without pause gate

## Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **OpenTelemetry for observability** | Vendor-neutral, industry standard, integrates with Prometheus/Grafana, supports distributed tracing across microservices | Datadog APM (cost), New Relic (cost), custom metrics only (no tracing) |
| **Prometheus + Grafana for metrics** | Already using prom-client, open-source, Kubernetes-ready, extensive dashboard ecosystem | InfluxDB (less adoption), CloudWatch (AWS lock-in), custom dashboards |
| **Testcontainers for integration tests** | Real PostgreSQL instances, no mocking of database, validates RLS and Prisma queries in production-like environment | SQLite (not representative), mocked Prisma (false confidence), shared test database (flaky) |
| **Vitest as primary test runner** | Already configured, fast, V8 coverage, good TS support | Jest (slower), Mocha (less ecosystem) |
| **Playwright for E2E** | Already configured, cross-browser, mobile emulation, auto-wait | Cypress (less mature), Selenium (slower) |
| **Docker Compose for production** | Already validated, simple orchestration, nginx reverse proxy | Kubernetes (overkill for MVP), ECS (AWS lock-in) |
| **Prisma 5 for ORM** | Already in use, type-safe, migration system, good PostgreSQL support | Drizzle (migration complexity), TypeORM (less type-safe) |
| **BullMQ for queues** | Already in use, Redis-backed, transactional outbox pattern, DLQ support | pg-boss (PostgreSQL-only, less features), Agenda (MongoDB dependency) |
| **jose for JWT** | Already in use, hardened implementation, HS256/RS256 support, no native crypto pitfalls | jsonwebtoken (older, less secure defaults) |
| **pino for logging** | Already in use, fast, structured JSON, PHI redaction, child loggers | Winston (slower), Bunyan (less maintained) |

## Risks / Trade-offs

| Risk | Mitigation |
|-------|-----------|
| Security audit reveals critical vulnerabilities requiring schema changes | Pause gate per auto-approval rules; schedule fix sprint |
| Performance optimization introduces regression in complex queries | Benchmark before/after, use query plan analysis, add integration tests |
| Load test reveals infrastructure bottleneck requiring architectural change | Start with vertical scaling, then horizontal if needed |
| Billing validation reveals edge cases requiring domain model changes | Document edge cases, prioritize P0 fixes, defer P1/P2 to post-launch |
| Documentation drift after launch | Assign owner, integrate docs updates into PR template |
| Test suite execution time exceeds CI limits | Parallelize with Vitest workers, split into quality gate + full suite |
| Third-party dependency vulnerabilities (npm audit) | Automated nightly scanning, SBOM generation, dependency update policy |

## Migration Plan

1. **Week 1**: Security audit + remediation, performance benchmarking, monitoring setup
2. **Week 2**: Reliability verification, workflow validation, billing validation
3. **Week 3**: Load testing, optimization, documentation generation
4. **Week 4**: Final regression suite, launch gate report, go/no-go decision
5. **Week 5-8**: Buffer for remediation, re-testing, pilot hospital preparation

## Open Questions

- Should we implement refresh token rotation or stick with session cookies?
- What is the acceptable false-positive rate for billing validation before launch?
- Which Grafana dashboard templates to use (custom vs. community)?
- Should we implement circuit breakers for external dependencies (ABDM, payment gateways)?
- What is the minimum viable backup retention period for the first pilot hospital?
