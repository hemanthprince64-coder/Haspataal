# Care Journey Engine

Enterprise Clinical Workflow Orchestration Platform

## Models
- JourneyTemplate - Reusable journey definitions
- JourneyTemplateVersion - Template versioning
- JourneyInstance - Individual patient journeys
- JourneyMilestone - Clinical/administrative milestones
- JourneyTask - Actionable tasks
- JourneyRisk - Risk scoring

## Integration
- Timeline Engine - Milestone/task events logged to timeline
- Rules Engine - `complete_milestone`, `update_journey_risk` actions
- Notification Engine - Patient reminders via rules

## Usage
```typescript
import { JourneyEngine } from '@haspataal/journey';

await JourneyEngine.enroll({
  templateId: 'pregnancy-template-id',
  patientId: 'patient-uuid',
  careTeam: { doctor: 'doctor-uuid', nurse: 'nurse-uuid' },
});
```

## API Endpoints
- POST /api/journeys - Create journey
- GET /api/journeys?patientId=uuid - List patient journeys

## Admin UI
- Journey Builder at /dashboard/journeys