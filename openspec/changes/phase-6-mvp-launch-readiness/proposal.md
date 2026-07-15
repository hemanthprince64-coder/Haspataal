## Why

Haspataal's bounded contexts (Phases 0–5B) are implemented, but the platform has never been validated for production deployment in a real hospital. Without systematic hardening across security, performance, reliability, observability, workflow fidelity, billing accuracy, and deployment readiness, the MVP cannot safely go live. This phase closes the gap between "feature complete" and "production ready."

## What Changes

- **Phase A — Security Hardening**: Complete production security audit, implement missing controls (secure headers, CSRF, secrets rotation, DPDP verification), fix vulnerabilities, produce Security Report + Risk Matrix.
- **Phase B — Performance Hardening**: Benchmark all P0 workflows (login, search, timeline, admission, etc.), eliminate N+1 queries, add missing indexes, optimize Prisma bottlenecks, validate outbox throughput.
- **Phase C — Reliability**: Verify outbox replay, consumer replay, projection rebuild, dead-letter replay, worker crash recovery, database restart recovery, idempotency, and transactional guarantees.
- **Phase D — Production Monitoring**: Add OpenTelemetry, Prometheus metrics, Grafana dashboards, structured logs, health/readiness/liveness endpoints, consumer lag metrics, alert rules.
- **Phase E — Hospital Workflow Validation**: Validate the complete patient journey (reception → discharge → follow-up) for minimum clicks, keyboard workflow, authorization, audit, rollback, timeline, and notifications.
- **Phase F — Billing Validation**: Verify every clinical event generates correct billing events (OPD, IPD, pharmacy, lab, radiology, procedure).
- **Phase G — Production Deployment**: Validate Docker images, CI/CD, zero-downtime deployment, feature flags, migrations, rollback, backup/restore, disaster recovery.
- **Phase H — Documentation**: Generate System Architecture, API docs, Admin/Doctor/Nurse/Reception manuals, Deployment Guide, DR Guide, Operations Runbook.
- **Phase I — Load Testing**: Run realistic production simulations (500 concurrent users, 100 OPDs, 10 admissions, 5 surgeries, 1K orders/hr, 100K timeline events, 1M outbox events).
- **Phase J — Final Launch Gate**: Execute complete regression suite across all prior phases with no skipped tests and no mocked architecture tests where real PostgreSQL verification is required.
- **Final Deliverables**: Launch Readiness Report, Security Report, Performance Report, Load Test Report, Reliability Report, Regression Matrix, Known Issues Register, MVP Feature Checklist, Go/No-Go Recommendation.

## Capabilities

### New Capabilities
- `security-hardening`: Production security audit, vulnerability remediation, OWASP Top 10 compliance, DPDP/PHI verification
- `performance-optimization`: Workflow benchmarking, N+1 elimination, index optimization, Prisma tuning
- `reliability-verification`: Outbox/consumer replay, crash recovery, idempotency validation
- `production-monitoring`: OpenTelemetry, Prometheus, Grafana dashboards, structured logs, health endpoints
- `workflow-validation`: End-to-end hospital workflow validation (reception through discharge)
- `billing-validation`: Clinical-to-billing event verification across all service lines
- `deployment-readiness`: Docker, CI/CD, zero-downtime deployment, backup/restore, DR validation
- `documentation-generation`: Complete operational and clinical documentation suite
- `load-testing`: Realistic production load simulation and bottleneck resolution
- `launch-gate`: Comprehensive regression suite execution and go/no-go determination

### Modified Capabilities
- (No existing capabilities require requirement-level changes — this phase builds on the established architecture.)

## Impact

- All backend services (`patient-portal`, `hospital-hms`, `admin-panel`, `gateway`, `auth`, `ai-docs`)
- All packages (`core`, `db`, `auth`, `events`, `logger`, `queue`, `timeline`, `search`, `rules`, `journey`, `notify`)
- All workers (notification, rules, outbox relay, escalation, DHIS2)
- Database schema (migrations, indexes, RLS policies)
- CI/CD pipelines (GitHub Actions)
- Docker infrastructure
- Test infrastructure (Vitest, Playwright, pytest, Testcontainers)
- Documentation (System Architecture, API docs, operational manuals)
