## ADDED Requirements

### Requirement: Chronic follow-up escalation trigger
The system SHALL evaluate each patient's consecutive missed follow-up count against their active care pathway and generate an escalation alert when the count reaches the hospital's configured threshold (default: 2).

#### Scenario: Escalation alert generated for 2 consecutive missed follow-ups
- **WHEN** a patient misses their 2nd consecutive chronic care follow-up appointment
- **THEN** the system SHALL create an `EscalationAlert` record with `missedCount = 2` and emit a `CHRONIC_ESCALATION_REQUIRED` event to both the `EventLog` table and the Redis Streams event bus

#### Scenario: No escalation for non-chronic follow-ups
- **WHEN** a patient misses a follow-up that is NOT part of an active chronic care pathway
- **THEN** the system SHALL NOT generate an escalation alert

#### Scenario: No duplicate escalation when already acknowledged
- **WHEN** an `EscalationAlert` record exists with `acknowledgedAt IS NOT NULL`
- **THEN** the system SHALL NOT create a duplicate escalation for the same missed follow-up sequence

### Requirement: Doctor escalation notification
The system SHALL deliver an escalation notification to the treating doctor via WhatsApp Business API (primary) with SMS fallback when no contact number is unregistered.

#### Scenario: Doctor receives WhatsApp escalation alert
- **WHEN** an escalation alert is generated and the doctor's contact is registered with WhatsApp Business
- **THEN** the system SHALL send a WhatsApp template message including patient name, hospital, missed appointment count, and direct HMS link

#### Scenario: SMS fallback when WhatsApp fails with 131026 (unregistered)
- **WHEN** the WhatsApp API returns error 131026 (recipient not registered on WhatsApp)
- **THEN** the system SHALL immediately fall back to SMS and mark the escalation channel as `SMS`

#### Scenario: Notification curfew — defer to 8 AM IST
- **WHEN** an escalation alert is generated between 10 PM and 8 AM IST
- **THEN** the system SHALL enqueue the notification for 8:00 AM IST instead of sending immediately

### Requirement: HMS Escalation Triage Widget
The system SHALL display an Escalations widget on the Hospital HMS dashboard under a dedicated section showing all unacknowledged escalations for the logged-in doctor.

#### Scenario: Doctor sees unacknowledged escalation
- **WHEN** a doctor logs into HMS and has one or more unacknowledged escalation alerts assigned to them
- **THEN** the Escalation Triage widget SHALL render a card for each escalation with patient name, hospital name, missed count, and an "Acknowledge" button

#### Scenario: Doctor acknowledges an escalation
- **WHEN** a doctor clicks "Acknowledge" on an escalation card
- **THEN** the system SHALL set `acknowledgedAt = NOW()` via `PATCH /v1/escalations/:id/acknowledge` and remove the card from the widget

#### Scenario: Escalation list is RLS-scoped
- **WHEN** a query for escalations is made
- **THEN** the system SHALL use `SET LOCAL app.hospital_id` to enforce RLS ensuring each hospital only sees their own escalation records

### Requirement: Idempotent escalation processing
The system SHALL prevent duplicate escalation records for the same follow-up sequence using a unique database constraint and a pre-check before record creation.

#### Scenario: Duplicate missed follow-up does not create duplicate alert
- **WHEN** a patient misses a follow-up and a record already exists in `EscalationAlert` for that appointment sequence
- **THEN** the system SHALL NOT create a second record and SHALL update the existing record's `missedCount` if incremented

### Requirement: Escalation API rate-limit and auth
The escalation API SHALL enforce the same auth and rate-limiting policies as the API Gateway:DOCTOR role rate-limit = 120 req/min; `X-Request-ID` correlation header on every response.

#### Scenario: Unauthorized patient cannot access escalation endpoints
- **WHEN** a user with PATIENT role calls `GET /v1/escalations`
- **THEN** the system SHALL return `403 Forbidden`

#### Scenario: Doctor rate-limited at 120 req/min for escalation endpoints
- **WHEN** a doctor exceeds 120 requests in a 60-second window
- **THEN** the system SHALL return `429 Too Many Requests` with `Retry-After` header via the existing Redis sliding window rate limiter
