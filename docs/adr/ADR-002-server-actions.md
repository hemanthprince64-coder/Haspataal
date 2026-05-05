# ADR-002: Using Next.js Server Actions for Data Mutations

* **Status:** Accepted
* **Decider:** Engineering Team
* **Date:** 2026-05-02

## Context and Problem Statement

The platform needs a fast, type-safe way to handle form submissions and data mutations. Traditional REST or GraphQL APIs require significant boilerplate for routing, serialization, and type synchronization between client and server.

## Decision Drivers

* Development speed and reduced boilerplate.
* Tight integration with Next.js App Router.
* End-to-end type safety with TypeScript and Zod.

## Considered Options

* **Separate REST API (Express/NestJS)**: Clean separation but high overhead for a small team.
* **GraphQL (Apollo/Nexus)**: Powerful but overkill for the current MVP scope.
* **tRPC**: Excellent type safety, but slightly more complex than native Server Actions.
* **Next.js Server Actions**: Native to the framework, simplest implementation for a Next.js-first team.

## Decision Outcome

Chosen option: **Next.js Server Actions**, because it allows us to build features significantly faster by co-locating mutation logic with UI components, while maintaining strict type safety from the form to the database.

### Consequences

* **Good:**
  * Zero-boilerplate data fetching and mutations.
  * Automatic revalidation of data using `revalidatePath`.
  * Improved developer experience (DX) with single-language full-stack development.
* **Bad:**
  * Harder to share logic with non-Next.js clients (e.g., legacy mobile apps).
  * Debugging can be more opaque compared to standard REST logs.
