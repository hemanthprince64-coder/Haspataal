## ADDED Requirements

### Requirement: Full-text search over timeline events
The system SHALL provide `GET /api/timeline/search` supporting full-text search over `title`, `summary`, and `tags` fields using PostgreSQL `tsvector` with a `GIN` index. Search SHALL be scoped to the authenticated user's access level (patient=own events, doctor=hospital patients, admin=all).

#### Scenario: Doctor searches for past diabetes diagnoses for a patient
- **WHEN** `GET /api/timeline/search?q=diabetes&patientId=<uuid>` is called by a doctor
- **THEN** the system SHALL return all `TimelineEvent` rows where the search vector matches "diabetes" scoped to that patient at the doctor's hospital
- **THEN** results SHALL be ordered by relevance score descending

#### Scenario: Empty search query
- **WHEN** `q` is empty or missing
- **THEN** the API SHALL return `400 Bad Request` with message `"Search query is required"`

### Requirement: Search supports structured filters
The search API SHALL accept these query parameters: `q` (text), `patientId`, `hospitalId`, `doctorId`, `category`, `severity`, `dateFrom`, `dateTo`, `module`, `tag`.

#### Scenario: Searching by medication and date range
- **WHEN** `GET /api/timeline/search?q=metformin&dateFrom=2025-01-01&dateTo=2026-01-01` is called
- **THEN** results SHALL only include events matching "metformin" within that date range

### Requirement: Search results are paginated
Search SHALL return cursor-paginated results with a default page size of 20 and a maximum of 100. Results SHALL include `totalCount` (approximate) and `nextCursor`.

#### Scenario: Patient searches with many results
- **WHEN** search returns more than 20 matching events
- **THEN** the response SHALL include `nextCursor` and `hasMore: true`
- **THEN** the next page SHALL be retrievable by passing `cursor=<nextCursor>`

### Requirement: Search response time is under 500ms
The system SHALL maintain a `GIN` full-text index on the `search_vector` tsvector column. Queries over up to 1 million events SHALL complete within 500ms at the 95th percentile.

#### Scenario: Search performance under load
- **WHEN** concurrent search queries hit the API
- **THEN** p95 response time SHALL NOT exceed 500ms for queries against up to 1M events
