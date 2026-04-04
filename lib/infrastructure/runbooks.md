# Haspataal Incident Response Runbooks

This document provides step-by-step instructions for the on-call team to handle critical system failures.

## 🚨 Scenario 1: Database Serialization Conflicts Spike
- **Observation**: High error rates for `P2034` in logs; booking success rate drops.
- **Action**:
    1.  Check Redis health (ensure locks are being released).
    2.  Check for long-running analytics queries on the primary DB.
    3.  If load is extreme, increase `maxRetries` in `SafeTransaction` wrapper (hot patch).

## 🚨 Scenario 2: Outbox Queue Stalling
- **Observation**: Notifications (SMS/Email) are not being received; `outbox_events` table growing rapidly.
- **Action**:
    1.  Verify the `OutboxWorker` service status.
    2.  Check SMS provider Circuit Breaker status (`circuit-breaker.ts`). 
    3.  If Circuit is OPEN, wait for provider recovery or switch to fallback upstream.

## 🚨 Scenario 3: Bulk Data Corruption Detection
- **Observation**: `integrity-checker.ts` alerts for overbooked slots.
- **Action**:
    1.  Identify the affected slots using `scripts/audit-overbooking.sql`.
    2.  Mark excess appointments as `CANCELLED` and notify patients manually.
    3.  Identify the root cause (e.g., manual schema bypass) and patch.

## 🚨 Scenario 4: Backup Recovery (RTO: 1hr, RPO: 5min)
- **Action**:
    1.  Terminate all app connections to prevent partial writes.
    2.  Restore the latest point-in-time snapshot from Supabase/Postgres.
    3.  Verify integrity using `integrity-checker.ts` before re-opening traffic.
