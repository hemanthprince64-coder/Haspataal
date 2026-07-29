## ADDED Requirements

### Requirement: Patient can view their complete longitudinal medical history
The system SHALL provide a patient-facing timeline API at `GET /api/timeline/patient/[patientId]` returning all `TimelineEvent` rows where `patientId` matches the authenticated patient. The response SHALL be cursor-paginated (50 events per page) and sorted chronologically descending.

#### Scenario: Patient opens their timeline
- **WHEN** a patient with `session_patient` cookie calls `GET /api/timeline/patient/me`
- **THEN** the system SHALL return their chronological event list grouped by month
- **THEN** events from ALL hospitals and ALL doctors the patient has visited SHALL be included
- **THEN** the response SHALL include a `nextCursor` for pagination

#### Scenario: Patient requests next page
- **WHEN** the patient provides a `cursor` query parameter from a previous response
- **THEN** the system SHALL return the next 50 events after that cursor
- **THEN** results SHALL NOT overlap with the previous page

#### Scenario: Another patient's timeline is requested
- **WHEN** patient A attempts to access patient B's timeline
- **THEN** the system SHALL return `403 Forbidden`
- **THEN** NO events SHALL be disclosed

### Requirement: Timeline supports grouped views
The API SHALL support a `group` query parameter accepting values: `month`, `type`, `hospital`, `doctor`. When grouped, events SHALL be returned in nested group objects rather than a flat list.

#### Scenario: Patient requests timeline grouped by event type
- **WHEN** `GET /api/timeline/patient/me?group=type` is called
- **THEN** the response SHALL contain groups like `{ PRESCRIPTION: [...], LAB_COMPLETED: [...] }`

### Requirement: Filterable timeline for patients
The timeline API SHALL support query parameters: `dateFrom`, `dateTo`, `category` (comma-separated), `severity` (`LOW|MEDIUM|HIGH|CRITICAL`).

#### Scenario: Patient filters by category
- **WHEN** patient calls `GET /api/timeline/patient/me?category=PRESCRIPTION,LAB`
- **THEN** only events with `category IN ('PRESCRIPTION', 'LAB')` SHALL be returned

### Requirement: Redis cache for patient timeline
The system SHALL cache patient timeline pages in Redis at key `timeline:patient:<patientId>:cursor:<cursor>` with a 5-minute TTL. Cache SHALL be invalidated when a new `TimelineEvent` is inserted for that patient.

#### Scenario: Cache hit on repeated timeline load
- **WHEN** a patient loads the same timeline page within 5 minutes
- **THEN** the system SHALL return the cached response without querying PostgreSQL
- **THEN** response time SHALL be under 200ms

#### Scenario: Cache invalidated after new event
- **WHEN** a new `TimelineEvent` is inserted for `patientId`
- **THEN** the system SHALL delete all `timeline:patient:<patientId>:*` Redis keys
