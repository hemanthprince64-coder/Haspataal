# Known Issues & Risk Matrix (Phase 6)

## Security & Data Privacy Risks
| Risk Area | Description | Severity | Mitigation Strategy | Status |
|-----------|-------------|----------|---------------------|--------|
| **JWT Secrets** | Leakage of `NEXTAUTH_SECRET` could compromise all sessions. | HIGH | Enforce rotation policy and CI/CD secret manager injection. Block builds with fallback keys. | MITIGATED |
| **CSRF** | State-changing API abuse | HIGH | Implemented dual-token (Cookie + Header) CSRF protection on Gateway | MITIGATED |

## Operational & Reliability Risks
| Risk Area | Description | Severity | Mitigation Strategy | Status |
|-----------|-------------|----------|---------------------|--------|
| **DB Pool Exhaustion** | Heavy loads spike Prisma connections | HIGH | PgBouncer configured; rate limiters enforce traffic shaping. | MONITORED |
| **Replay Collisions** | Consumers duplicate actions upon worker crash | MEDIUM | `pg_advisory_xact_lock` transaction isolations implemented in Phase 4. | MITIGATED |

## Known Issues (Deferred post-MVP)
1. **Analytics Dashboard Cold Start:** First-time loads on `analytics_patient_projections` take ~800ms. (Deferred to Phase 7 caching layer).
2. **Offline Mode:** No full offline-first syncing capabilities for OPD workflows. (Deferred to Mobile App Phase).
