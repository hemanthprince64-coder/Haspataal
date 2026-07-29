## Context

Patient portal currently has no way to discover doctors. Doctors are registered via `/api/doctors` but not published to a searchable index. Hospital affiliations exist but aren't aggregated for patient discovery. Availability is computed on-demand rather than cached/normalized.

## Goals / Non-Goals

**Goals:**
- Aggregate verified doctors with active hospital affiliations into a search index
- Compute and cache real-time availability
- Provide search API with filters (specialty, location, fees, ratings)
- Enable alternative doctor suggestions
- Maintain RLS compliance for patient reads

**Non-Goals:**
- Doctor profile editing (handled by existing APIs)
- Hospital-level doctor management
- Real-time WebSocket updates (future phase)

## Decisions

### Decision 1: Search Index Materialized View
**Chosen**: Database table `DoctorSearchIndex` updated via triggers
**Rationale**: Fast queries, works with existing Prisma stack
**Alternatives**: Elasticsearch (too complex), Redis hashes (not persistent)

### Decision 2: Availability Computation
**Chosen**: Computed on-demand + cached for 5 minutes
**Rationale**: Schedules change frequently, real-time accuracy needed
**Alternatives**: Pre-computed slots (stale data risk), real-time calculation (performance risk)

### Decision 3: Distance Calculation
**Chosen**: Haversine formula with hospital lat/lng stored
**Rationale**: No external dependency for core functionality
**Alternatives**: Google Maps Distance Matrix (cost), PostGIS (complexity)

### Decision 4: Event-Driven Updates
**Chosen**: BullMQ job on doctor/hospital changes
**Rationale**: Decouples computation from write path
**Alternatives**: Database triggers (complex), synchronous updates (latency)

## Risks / Trade-offs

- [Stale Index Risk] → 5-minute cache TTL + manual refresh endpoint
- [RLS Complexity] → Index is read-only for patients, write requires hospital context
- [Performance Impact] → Async indexing, pagination limits, query optimization
- [Search Relevance] → Simple text search now, Elasticsearch future