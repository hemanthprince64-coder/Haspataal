# ADR-005: Choosing jose over NextAuth.js for Session Management

* **Status:** Accepted
* **Decider:** Security Team
* **Date:** 2026-05-05

## Context and Problem Statement

The platform requires extremely granular control over session management across 6 different user roles. We need to support role-specific cookie names, custom JWT claims for multi-tenant isolation, and a unified session mechanism that works across both the Next.js apps and the Express API Gateway.

## Decision Drivers

* Control over cookie attributes and cross-portal session persistence.
* Lightweight footprint without the overhead of NextAuth.js database adapters.
* Unification between Next.js and external microservices.

## Considered Options

* **NextAuth.js**: Excellent for standard social logins, but becomes complex when managing custom multi-tenant logic and role-based redirects.
* **jose (JWT Utility)**: Low-level, standard-compliant library for JWT signing and verification.

## Decision Outcome

Chosen option: **jose**, because it gives us the surgical precision needed to manage a custom multi-role healthcare authentication system without being tied to the abstractions of a higher-level framework like NextAuth.js.

### Consequences

* **Good:**
  * Full control over JWT claims (userId, role, hospitalId).
  * Fast verification in Middleware using standard Web Crypto APIs.
  * Shared session logic between Next.js and API Gateway.
* **Bad:**
  * Requires manual implementation of login/logout/refresh logic.
  * No built-in support for social login providers (not a priority for HMS/Admin users).
