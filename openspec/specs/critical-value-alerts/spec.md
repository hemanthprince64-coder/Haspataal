## ADDED Requirements

### Requirement: Critical Value Detection
The system SHALL automatically detect if a verified result contains any values designated as "Critical" based on the template's critical thresholds.

#### Scenario: Dispatching Critical Alert
- **WHEN** a pathologist verifies a result containing a critical value
- **THEN** a `CRITICAL_VALUE_DETECTED` event is published
- **THEN** the system asynchronously dispatches an urgent alert to the ordering physician

#### Scenario: Non-Critical Verification
- **WHEN** a pathologist verifies a result with only normal or mildly abnormal values
- **THEN** the result is verified normally without dispatching a critical alert
