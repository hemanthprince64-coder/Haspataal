## ADDED Requirements

### Requirement: Load test infrastructure
Load testing infrastructure SHALL be implemented using k6 or Artillery with realistic user scenarios and monitoring integration.

#### Scenario: Load test execution
- **WHEN** load test is initiated
- **THEN** test runs with 500 concurrent virtual users

### Requirement: 500 concurrent user simulation
The platform SHALL handle 500 concurrent users performing typical hospital workflows without degradation.

#### Scenario: Concurrent user load
- **WHEN** 500 users perform mixed workflows
- **THEN** P95 latency remains under 300ms and error rate is under 1%

### Requirement: 100 simultaneous OPDs
The platform SHALL handle 100 simultaneous OPD consultations with correct data isolation and performance.

#### Scenario: OPD load
- **WHEN** 100 OPD consultations happen simultaneously
- **THEN** all consultations complete with correct data and P95 under 500ms

### Requirement: 10 concurrent admissions
The platform SHALL handle 10 concurrent admissions without data corruption or performance degradation.

#### Scenario: Admission load
- **WHEN** 10 patients are admitted simultaneously
- **THEN** all admissions are recorded correctly

### Requirement: 5 concurrent surgeries
The platform SHALL handle 5 concurrent surgeries with correct procedure tracking and billing.

#### Scenario: Surgery load
- **WHEN** 5 surgeries are performed simultaneously
- **THEN** all procedures, OT bookings, and billing are correct

### Requirement: 1,000 orders per hour
The platform SHALL process 1,000 orders per hour across pharmacy, lab, and radiology without queue backlog.

#### Scenario: Order throughput
- **WHEN** 1,000 orders are placed per hour
- **THEN** all orders are processed with consumer lag under 10 seconds

### Requirement: 100,000 timeline events
The platform SHALL load and display timelines with 100,000 events in under 500ms.

#### Scenario: Timeline scale
- **WHEN** patient timeline has 100,000 events
- **THEN** timeline loads in under 500ms

### Requirement: 1 million outbox events
The outbox system SHALL handle 1 million events without performance degradation or data loss.

#### Scenario: Outbox scale
- **WHEN** 1 million events are in the outbox
- **THEN** consumer throughput keeps pace and replay completes in under 30 minutes

### Requirement: Automatic bottleneck resolution
Load test bottlenecks SHALL be automatically identified and resolved through indexing, query optimization, or scaling.

#### Scenario: Bottleneck resolution
- **WHEN** load test identifies slow query
- **THEN** query is optimized and retest passes
