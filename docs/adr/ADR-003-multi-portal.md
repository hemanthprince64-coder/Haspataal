# ADR-003: Multi-Portal Architecture for Role-Specific UX

* **Status:** Accepted
* **Decider:** Product Architecture
* **Date:** 2026-05-03

## Context and Problem Statement

Haspataal serves 6 distinct user roles (Patient, Doctor, Hospital Admin, Staff, Agent, Super Admin). Each role has vastly different UX requirements—from a patient's simple booking flow to a hospital's high-density clinical dashboard. A single monolithic app would lead to massive bundle sizes and complex, brittle conditional logic.

## Decision Drivers

* UX specialization for different personas.
* Bundle size optimization and performance.
* Independent deployment and scaling of different platform areas.

## Considered Options

* **Single App with Role-Based Routing**: Simple to start, but becomes unmanageable as role-specific features grow.
* **Multi-Portal Architecture (Separate Apps)**: Independent portals for Patients, Hospitals, and Admins.

## Decision Outcome

Chosen option: **Multi-Portal Architecture**, because it allows us to optimize each portal for its specific user base. The Hospital portal can be a high-density "SaaS" interface, while the Patient portal can be a lightweight "Consumer" app.

### Consequences

* **Good:**
  * Clean separation of concerns and simpler role-based code.
  * Faster build times for individual portals.
  * Specialized UI libraries for each portal (e.g., Lucide for HMS, custom icons for Patients).
* **Bad:**
  * Some duplication of common logic (addressed by monorepo shared packages).
  * Complexity in managing cross-portal navigation and unified session state.
