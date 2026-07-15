## ADDED Requirements

### Requirement: API P95 latency target
All API endpoints SHALL achieve P95 latency under 300ms under normal load conditions.

#### Scenario: API latency measurement
- **WHEN** 100 concurrent users perform typical operations
- **THEN** P95 latency for all API endpoints is under 300ms

### Requirement: Search latency target
Patient and doctor search operations SHALL complete in under 200ms.

#### Scenario: Search performance
- **WHEN** user performs search with 10,000+ patient records
- **THEN** search results are returned in under 200ms

### Requirement: Timeline loading target
Clinical timeline loading SHALL complete in under 500ms for timelines with 100,000 events.

#### Scenario: Timeline performance
- **WHEN** doctor loads patient timeline with 100,000 events
- **THEN** timeline renders in under 500ms

### Requirement: Admission workflow target
The complete admission workflow SHALL complete in under 1 second.

#### Scenario: Admission performance
- **WHEN** receptionist creates new admission
- **THEN** admission is recorded and confirmed in under 1 second

### Requirement: N+1 query elimination
All list and detail endpoints SHALL use eager loading or batch queries. N+1 query patterns SHALL be detected and eliminated.

#### Scenario: No N+1 queries
- **WHEN** application loads list of 50 patients with their appointments
- **THEN** database executes 2 queries (patients + appointments) not 51

### Requirement: Missing index coverage
All frequently queried columns SHALL have appropriate database indexes. Missing indexes SHALL be identified via query plan analysis and added.

#### Scenario: Index coverage
- **WHEN** query plan analysis identifies missing index on `patient_id` column
- **THEN** index is added and query performance improves

### Requirement: Prisma bottleneck optimization
Prisma query patterns SHALL be optimized. N+1 in Prisma SHALL be eliminated via `include`/`select`. Connection pooling SHALL be configured.

#### Scenario: Prisma optimization
- **WHEN** application loads related entities
- **THEN** Prisma uses single query with include instead of multiple sequential queries

### Requirement: Outbox throughput
Outbox event insertion SHALL not block transaction commits. Consumer processing SHALL keep pace with event generation under peak load.

#### Scenario: Outbox throughput
- **WHEN** 1,000 events are generated per second
- **THEN** all events are persisted and consumed with no consumer lag exceeding 5 seconds

### Requirement: Consumer lag monitoring
Message queue consumer lag SHALL be monitored and SHALL not exceed 10 seconds under normal load.

#### Scenario: Consumer lag alert
- **WHEN** consumer processing falls behind by 15 seconds
- **THEN** alert is triggered and consumer auto-scales
