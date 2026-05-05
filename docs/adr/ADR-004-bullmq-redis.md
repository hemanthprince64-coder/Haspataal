# ADR-004: Using BullMQ and Redis for Background Jobs

* **Status:** Accepted
* **Decider:** Engineering Team
* **Date:** 2026-05-04

## Context and Problem Statement

Asynchronous tasks like sending WhatsApp notifications, generating financial reports, and calculating agent commissions cannot be performed during the request-response cycle without degrading user experience.

## Decision Drivers

* Reliability and message persistence.
* Support for delayed jobs and retries.
* Scalability and monitoring.

## Considered Options

* **Inngest**: Great DX and serverless support, but requires external cloud dependencies.
* **pg-boss**: Relies on PostgreSQL, adding load to the primary database.
* **BullMQ + Redis**: Industry-standard Node.js queue, extremely fast, and highly reliable.

## Decision Outcome

Chosen option: **BullMQ + Redis**, because it is the most robust and performant queueing library for the Node.js ecosystem, with excellent support for distributed workers and observability via tools like BullBoard.

### Consequences

* **Good:**
  * Sub-millisecond enqueueing time.
  * Native support for priority queues and job dependencies.
  * Reliable retries with exponential backoff.
* **Bad:**
  * Requires managing a Redis instance (Haspataal already uses Redis for rate-limiting).
  * Increases complexity in local development and testing.
