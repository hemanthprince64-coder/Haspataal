## ADDED Requirements

### Requirement: Platform admin can view timeline ingestion analytics
The system SHALL provide `GET /api/admin/timeline/analytics` returning aggregate metrics: total events ingested today, events by category, failed ingestion count, dead-letter queue depth, average ingestion latency (ms), and storage growth rate.

#### Scenario: Admin reviews daily timeline metrics
- **WHEN** a `SUPER_ADMIN` calls `GET /api/admin/timeline/analytics`
- **THEN** the response SHALL include `{ totalEventsToday, byCategory, failedCount, deadLetterCount, avgLatencyMs, storageGrowthKbPerDay }`

### Requirement: Admin can inspect dead-letter queue events
The system SHALL provide `GET /api/admin/timeline/dead-letters` listing failed ingestion events with their error reason, original payload (PHI redacted), and retry count. Admin SHALL be able to retry or discard individual dead-letter entries via `POST /api/admin/timeline/dead-letters/[id]/retry` and `DELETE /api/admin/timeline/dead-letters/[id]`.

#### Scenario: Admin retries a failed event
- **WHEN** admin calls `POST /api/admin/timeline/dead-letters/[id]/retry`
- **THEN** the BullMQ job SHALL be re-queued to `timeline-ingestion`
- **THEN** the dead-letter entry SHALL be removed from the dead-letter queue

### Requirement: Admin timeline analytics are scoped by tenant
Admin analytics SHALL support `?hospitalId=<id>` filtering to inspect timeline metrics for a specific hospital.

#### Scenario: Admin filters analytics to a single hospital
- **WHEN** `GET /api/admin/timeline/analytics?hospitalId=<uuid>` is called
- **THEN** all metrics SHALL be computed only for events with that `hospitalId`
