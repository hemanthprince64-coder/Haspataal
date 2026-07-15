## 1. Phase A — Security Hardening

- [ ] 1.1 Run OWASP ZAP scan on all endpoints and document findings
- [ ] 1.2 Audit RBAC policies for all 40+ domain actions
- [ ] 1.3 Verify RLS policies on all tables with cross-tenant access tests
- [ ] 1.4 Implement secure headers middleware (CSP, HSTS, X-Frame-Options, etc.)
- [ ] 1.5 Add CSRF token validation to all state-changing endpoints
- [ ] 1.6 Verify SQL injection protection via Prisma parameterization
- [ ] 1.7 Implement XSS sanitization for user-generated content
- [ ] 1.8 Audit secrets management and add rotation support
- [ ] 1.9 Verify DPDP compliance (data export, deletion, consent)
- [ ] 1.10 Verify PHI encryption at rest and in transit
- [ ] 1.11 Audit audit log completeness and add missing entries
- [ ] 1.12 Verify session security (HttpOnly, Secure, SameSite)
- [ ] 1.13 Implement refresh token rotation
- [ ] 1.14 Add automated tenant isolation tests
- [ ] 1.15 Generate Security Report and Risk Matrix

## 2. Phase B — Performance Hardening

- [ ] 2.1 Benchmark login workflow latency
- [ ] 2.2 Benchmark patient search latency
- [ ] 2.3 Benchmark appointment booking latency
- [ ] 2.4 Benchmark OPD consultation latency
- [ ] 2.5 Benchmark admission workflow latency
- [ ] 2.6 Benchmark order creation latency
- [ ] 2.7 Benchmark pharmacy workflow latency
- [ ] 2.8 Benchmark laboratory workflow latency
- [ ] 2.9 Benchmark radiology workflow latency
- [ ] 2.10 Benchmark timeline loading latency
- [ ] 2.11 Identify and fix N+1 queries
- [ ] 2.12 Add missing database indexes
- [ ] 2.13 Optimize slow joins
- [ ] 2.14 Optimize Prisma query patterns
- [ ] 2.15 Optimize outbox throughput
- [ ] 2.16 Monitor and optimize consumer lag
- [ ] 2.17 Generate Performance Report

## 3. Phase C — Reliability

- [ ] 3.1 Execute outbox replay test
- [ ] 3.2 Execute consumer replay test
- [ ] 3.3 Execute projection rebuild test
- [ ] 3.4 Execute dead-letter replay test
- [ ] 3.5 Execute worker crash recovery test
- [ ] 3.6 Execute database restart recovery test
- [ ] 3.7 Verify mid-transaction rollback
- [ ] 3.8 Verify concurrent replay safety
- [ ] 3.9 Verify duplicate delivery idempotency
- [ ] 3.10 Verify replay interruption and resume
- [ ] 3.11 Generate Reliability Report

## 4. Phase D — Production Monitoring

- [ ] 4.1 Add OpenTelemetry instrumentation to all services
- [ ] 4.2 Configure Prometheus metrics exporters
- [ ] 4.3 Create Grafana API latency dashboard
- [ ] 4.4 Create Grafana error rates dashboard
- [ ] 4.5 Create Grafana queue metrics dashboard
- [ ] 4.6 Create Grafana consumer lag dashboard
- [ ] 4.7 Create Grafana database metrics dashboard
- [ ] 4.8 Create Grafana system resources dashboard
- [ ] 4.9 Add structured logging with correlation IDs
- [ ] 4.10 Implement health endpoints on all services
- [ ] 4.11 Implement readiness probes
- [ ] 4.12 Implement liveness probes
- [ ] 4.13 Define and configure alert rules
- [ ] 4.14 Generate Operations Dashboard and Alert Rules

## 5. Phase E — Hospital Workflow Validation

- [ ] 5.1 Validate reception → patient registration workflow
- [ ] 5.2 Validate appointment booking workflow
- [ ] 5.3 Validate OPD consultation workflow
- [ ] 5.4 Validate orders workflow
- [ ] 5.5 Validate pharmacy workflow
- [ ] 5.6 Validate laboratory workflow
- [ ] 5.7 Validate radiology workflow
- [ ] 5.8 Validate procedure workflow
- [ ] 5.9 Validate billing workflow
- [ ] 5.10 Validate discharge workflow
- [ ] 5.11 Validate follow-up workflow
- [ ] 5.12 Verify minimum clicks for each workflow
- [ ] 5.13 Verify keyboard workflow support
- [ ] 5.14 Verify authorization at each step
- [ ] 5.15 Verify audit trail at each step
- [ ] 5.16 Verify rollback capability
- [ ] 5.17 Verify timeline accuracy
- [ ] 5.18 Verify care journey continuity
- [ ] 5.19 Verify billing integration
- [ ] 5.20 Verify notification delivery

## 6. Phase F — Billing Validation

- [ ] 6.1 Verify OPD billing event generation
- [ ] 6.2 Verify IPD billing event generation
- [ ] 6.3 Verify pharmacy billing event generation
- [ ] 6.4 Verify laboratory billing event generation
- [ ] 6.5 Verify radiology billing event generation
- [ ] 6.6 Verify procedure billing event generation
- [ ] 6.7 Verify billing reconciliation accuracy
- [ ] 6.8 Run billing reconciliation report

## 7. Phase G — Production Deployment

- [ ] 7.1 Validate all Docker images build and scan
- [ ] 7.2 Validate CI/CD pipeline quality gates
- [ ] 7.3 Test zero-downtime deployment procedure
- [ ] 7.4 Implement and test feature flags
- [ ] 7.5 Validate database migration safety
- [ ] 7.6 Test automated rollback procedure
- [ ] 7.7 Verify backup procedures
- [ ] 7.8 Test restore procedures
- [ ] 7.9 Document and test disaster recovery procedures
- [ ] 7.10 Generate Deployment Guide and DR Guide

## 8. Phase H — Documentation

- [ ] 8.1 Generate System Architecture documentation
- [ ] 8.2 Generate API Documentation
- [ ] 8.3 Generate Admin Manual
- [ ] 8.4 Generate Doctor Manual
- [ ] 8.5 Generate Nurse Manual
- [ ] 8.6 Generate Reception Manual
- [ ] 8.7 Generate Deployment Guide
- [ ] 8.8 Generate Disaster Recovery Guide
- [ ] 8.9 Generate Operations Runbook

## 9. Phase I — Load Testing

- [ ] 9.1 Implement k6 load test scripts for all workflows
- [ ] 9.2 Run 500 concurrent user simulation
- [ ] 9.3 Run 100 simultaneous OPD simulation
- [ ] 9.4 Run 10 concurrent admission simulation
- [ ] 9.5 Run 5 concurrent surgery simulation
- [ ] 9.6 Run 1,000 orders/hour simulation
- [ ] 9.7 Run 100,000 timeline events simulation
- [ ] 9.8 Run 1 million outbox events simulation
- [ ] 9.9 Analyze bottlenecks and optimize
- [ ] 9.10 Generate Load Test Report

## 10. Phase J — Final Launch Gate

- [ ] 10.1 Execute Phase 0A regression tests
- [ ] 10.2 Execute Phase 0B regression tests
- [ ] 10.3 Execute Phase 1 regression tests
- [ ] 10.4 Execute Phase 2 regression tests
- [ ] 10.5 Execute Phase 3 regression tests
- [ ] 10.6 Execute Phase 4 regression tests
- [ ] 10.7 Execute Phase 5A regression tests
- [ ] 10.8 Execute Phase 5B.1 regression tests
- [ ] 10.9 Execute Phase 5B.2 regression tests
- [ ] 10.10 Execute Phase 5B.3 regression tests
- [ ] 10.11 Execute Phase 5B.4 regression tests
- [ ] 10.12 Execute Phase 5B.5 regression tests
- [ ] 10.13 Execute Phase 5B.6 regression tests
- [ ] 10.14 Verify no mocked architecture tests where real PostgreSQL is required
- [ ] 10.15 Generate Regression Matrix

## 11. Final Deliverables

- [ ] 11.1 Generate Launch Readiness Report
- [ ] 11.2 Generate Security Report
- [ ] 11.3 Generate Performance Report
- [ ] 11.4 Generate Load Test Report
- [ ] 11.5 Generate Reliability Report
- [ ] 11.6 Generate Regression Matrix
- [ ] 11.7 Generate Known Issues Register
- [ ] 11.8 Generate MVP Feature Checklist
- [ ] 11.9 Make Go/No-Go recommendation
