# ADR-001: Using Supabase as the managed PostgreSQL provider

* **Status:** Accepted
* **Decider:** Architectural Committee
* **Date:** 2026-05-01

## Context and Problem Statement

Haspataal is a multi-tenant healthcare platform targeting tier-2/3 cities. We require a database solution that provides high availability, reliable backups, and a strong security model for data isolation. Given the small DevOps team, we need a managed service that reduces operational overhead.

## Decision Drivers

* Need for strong multi-tenant data isolation (Row-Level Security).
* Requirement for automated, point-in-time recovery (PITR) backups.
* Simplified connection pooling (PgBouncer/Supavisor).
* Scalability as the number of hospitals increases.

## Considered Options

* **Self-hosted PostgreSQL on EC2/RDS**: High control but high operational burden.
* **PlanetScale (MySQL/Vitess)**: Excellent scaling, but lacks native PostgreSQL RLS and healthcare-specific ecosystem support.
* **Supabase (Managed PostgreSQL)**: Native PostgreSQL with built-in RLS, Auth, and Storage.

## Decision Outcome

Chosen option: **Supabase**, because it provides the most comprehensive "out-of-the-box" support for PostgreSQL Row-Level Security (RLS), which is the cornerstone of our multi-tenant data isolation strategy.

### Consequences

* **Good:**
  * Strict data isolation at the database level via RLS.
  * Managed backups and easy horizontal scaling.
  * Integrated Auth and Realtime features available if needed.
* **Bad:**
  * Vendor lock-in to Supabase-specific infrastructure.
  * Pricing can become significant at very high scale compared to self-hosted.
  * Limited control over certain PostgreSQL extensions and low-level kernel tuning.
