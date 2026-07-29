# Unified Notification Engine

Centralized communication platform for all Haspataal notifications.

## Architecture
- **Router**: Channel/routing based on priority and user preferences
- **Queues**: BullMQ with Redis for async delivery
- **Workers**: Channel-specific delivery workers with retry
- **Providers**: SMS (Twilio), WhatsApp (Meta), Email (Resend) adapters

## Models
- `Notification` - Core notification record (extended from existing)
- `NotificationTemplate` - Existing template model
- `NotificationEventMapping` - Existing event-to-template mapping
- `NotificationProvider` - Provider configuration
- `NotificationCampaign` - Bulk notification campaigns
- `NotificationDelivery` - Delivery tracking
- `NotificationPreference` - User channel preferences (planned)

## Usage

```typescript
import { NotificationEngine } from '@haspataal/notify';
import { TwilioSMSAdapter } from '@haspataal/notify';

const engine = new NotificationEngine([
  new TwilioSMSAdapter({ accountSid, authToken, from }),
]);

await engine.enqueue({
  hospitalId: 'uuid',
  patientId: 'uuid',
  priority: 'HIGH',
  recipient: '+919999999999',
  body: 'Your appointment is confirmed',
});
```

## API Endpoints
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - List notifications

## Healthcare Safety Rules
- Emergency alerts bypass quiet hours
- OTP always high priority
- PHI minimized in notifications
- HIPAA-compliant templates required