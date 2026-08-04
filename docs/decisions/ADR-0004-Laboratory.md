Version: 1.0
Owner: Haspataal Engineering
Last Updated: 2026-08

# ADR-0004: Laboratory Module Integration

## Context
Laboratory diagnostics are a core revenue driver for hospitals. We need to integrate laboratory orders with the overarching `ClinicalOrder` architecture while maintaining LIS (Laboratory Information System) compatibility.

## Decision
Laboratory tests will be managed via the `ClinicalOrder` entity. Lab-specific attributes (turnaround SLAs, sample collection status) will be handled as metadata or domain events (`SAMPLE_COLLECTED`, `RESULTS_PUBLISHED`) rather than splitting the DB schema.

## Alternatives
A dedicated `LaboratoryTest` table was considered but rejected to maintain a unified billing and ordering pipeline.

## Consequences
- Requires strict DTO mapping between the `ClinicalOrder` generic payload and LIS endpoints.
