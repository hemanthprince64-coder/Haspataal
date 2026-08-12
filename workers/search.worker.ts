import { SearchService, PostgresSearchProvider, SearchCommandHandler } from '@haspataal/search';
import { eventBus, DomainEvent, EVENT_TYPES } from '@haspataal/events';
import { v4 as uuidv4 } from 'uuid';
import logger from '../apps/patient-portal/lib/logger';

const provider = new PostgresSearchProvider();
const searchService = new SearchService(provider);
const commandHandler = new SearchCommandHandler(searchService);

// A simple in-memory inbox for idempotency within this worker process
const inboxCache = new Set<string>();

async function onDomainEvent(event: DomainEvent) {
  if (inboxCache.has(event.id)) {
    return; // Already processed
  }
  inboxCache.add(event.id);
  // Keep cache bounded
  if (inboxCache.size > 10000) inboxCache.clear();

  const rawPayload = event.payload as any;
  const payload = rawPayload.payload || rawPayload.eventPayload || rawPayload;

  try {
    if (event.type.endsWith('_DELETED')) {
      const entityType = event.type.replace('_DELETED', '').toLowerCase();
      const entityId = payload.id;
      if (entityId) {
        await commandHandler.handleDeleteDocument({
          commandId: uuidv4(),
          commandVersion: 1,
          target: 'search',
          tenantContext: { hospitalId: event.hospitalId || 'system', branchId: 'default' },
          actorContext: { actorId: event.actor?.id || 'system', actorType: 'SYSTEM' },
          correlationId: event.correlationId || uuidv4(),
          idempotencyKey: `delete-${event.id}`,
          timestamp: new Date().toISOString(),
          payload: {
            entityType,
            entityId,
          }
        });
      }
      return;
    }

    let searchPayload: any = null;

    switch (event.type) {
      case EVENT_TYPES.PATIENT_REGISTERED:
      case 'PATIENT_UPDATED':
        searchPayload = {
          entityType: 'patient',
          entityId: payload.id,
          hospitalId: event.hospitalId || payload.hospitalId,
          title: `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Unknown Patient',
          content: `Phone: ${payload.phone || ''} Gender: ${payload.gender || ''}`,
          metadata: payload,
        };
        break;

      case 'DOCTOR_ADDED':
      case EVENT_TYPES.DOCTOR_VERIFIED:
      case 'DOCTOR_UPDATED':
        searchPayload = {
          entityType: 'doctor',
          entityId: payload.id,
          hospitalId: event.hospitalId || payload.hospitalId,
          title: `Dr. ${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Unknown Doctor',
          content: `Specialty: ${payload.specialty || ''} Qualifications: ${payload.qualifications || ''}`,
          metadata: payload,
        };
        break;

      case EVENT_TYPES.APPOINTMENT_BOOKED:
      case EVENT_TYPES.APPOINTMENT_CANCELLED:
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_UPDATED':
        searchPayload = {
          entityType: 'appointment',
          entityId: payload.id,
          hospitalId: event.hospitalId || payload.hospitalId,
          title: `Appointment for ${payload.patientName || 'Patient'} with Dr. ${payload.doctorName || 'Doctor'}`,
          content: `Date: ${payload.date || ''} Time: ${payload.time || ''} Status: ${event.type}`,
          metadata: payload,
        };
        break;

      case EVENT_TYPES.VISIT_STARTED:
      case EVENT_TYPES.VISIT_COMPLETED:
      case 'VISIT_CREATED':
      case 'VISIT_UPDATED':
        searchPayload = {
          entityType: 'visit',
          entityId: payload.id,
          hospitalId: event.hospitalId || payload.hospitalId,
          title: `Visit for Patient ${payload.patientId}`,
          content: `Status: ${payload.status || 'Created'}. Reason: ${payload.reason || 'N/A'}`,
          metadata: payload,
        };
        break;

      default:
        if (event.type.startsWith('TIMELINE_') || payload.timelineEventId) {
          searchPayload = {
            entityType: 'timeline',
            entityId: payload.timelineEventId || payload.id,
            hospitalId: event.hospitalId || payload.hospitalId,
            title: payload.title || event.type,
            content: payload.description || JSON.stringify(payload),
            metadata: payload,
          };
        }
        break;
    }

    if (searchPayload) {
      await commandHandler.handleIndexDocument({
        commandId: uuidv4(),
        commandVersion: 1,
        target: 'search',
        tenantContext: { hospitalId: event.hospitalId || 'system', branchId: 'default' },
        actorContext: { actorId: event.actor?.id || 'system', actorType: 'SYSTEM' },
        correlationId: event.correlationId || uuidv4(),
        idempotencyKey: `index-${event.id}`,
        timestamp: new Date().toISOString(),
        payload: searchPayload
      });
    }

  } catch (error: any) {
    logger.error({ action: 'search_worker_failed', eventId: event.id, error: error.message }, 'Failed to process search event');
  }
}

// Subscribe to all events, since search indexes almost everything
logger.info('Search Worker Started - Listening to EventBus');

// A generic "catch-all" isn't explicitly natively supported by simple EventEmitter without wildcard libs,
// but for simplicity in this implementation we assume the Outbox Relay triggers a special wildcard or we subscribe to known types.
// A more robust pub/sub client (e.g. BullMQ) handles this via wildcards.
const KNOWN_TYPES = [
  EVENT_TYPES.PATIENT_REGISTERED, 'PATIENT_UPDATED', 'PATIENT_DELETED',
  'DOCTOR_ADDED', EVENT_TYPES.DOCTOR_VERIFIED, 'DOCTOR_UPDATED', 'DOCTOR_DELETED',
  EVENT_TYPES.APPOINTMENT_BOOKED, EVENT_TYPES.APPOINTMENT_CANCELLED, 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_UPDATED',
  EVENT_TYPES.VISIT_STARTED, EVENT_TYPES.VISIT_COMPLETED, 'VISIT_CREATED', 'VISIT_UPDATED',
];

for (const type of KNOWN_TYPES) {
  eventBus.subscribe(type, onDomainEvent);
}

// Listen to any TIMELINE_* events
eventBus.on('newListener', (event, listener) => {
  // If we wanted to listen dynamically...
});
