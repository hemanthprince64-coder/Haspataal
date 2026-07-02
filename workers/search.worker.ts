import { SearchService, PostgresSearchProvider } from '@haspataal/search';
import { PrismaClient } from '@prisma/client';

import logger from '../apps/patient-portal/lib/logger';

const prisma = new PrismaClient();
const provider = new PostgresSearchProvider(prisma as any);
const searchService = new SearchService(provider);

async function processOutboxEvents() {
  const BATCH_SIZE = 50;

  try {
    // Process inside transaction to hold row locks
    await prisma.$transaction(
      async (tx) => {
        const events = await tx.$queryRaw<any[]>`
        SELECT id, event_type as "eventType", payload, error_count as "errorCount"
        FROM outbox_events 
        WHERE processed = false AND (error_count < 3 OR error_count IS NULL)
        ORDER BY created_at ASC 
        LIMIT ${BATCH_SIZE} 
        FOR UPDATE SKIP LOCKED
      `;

        if (!events || events.length === 0) return;

        for (const event of events) {
          // payload from $queryRaw might be stringified or json object depending on pg driver
          const payload =
            typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

          try {
            // Handle Hard Deletes first
            if (event.eventType.endsWith('_DELETED')) {
              const entityType = event.eventType.replace('_DELETED', '').toLowerCase();
              const entityId = payload.id;
              if (entityId) {
                await searchService.delete(entityId, entityType);
              }
            } else {
              switch (event.eventType) {
                case 'PATIENT_REGISTERED':
                case 'PATIENT_UPDATED':
                  await searchService.index({
                    entityType: 'patient',
                    entityId: payload.id,
                    hospitalId: payload.hospitalId,
                    title:
                      `${payload.firstName || ''} ${payload.lastName || ''}`.trim() ||
                      'Unknown Patient',
                    content: `Phone: ${payload.phone || ''} Gender: ${payload.gender || ''}`,
                    metadata: payload,
                  });
                  break;

                case 'DOCTOR_ADDED':
                case 'DOCTOR_REGISTERED':
                case 'DOCTOR_UPDATED':
                  await searchService.index({
                    entityType: 'doctor',
                    entityId: payload.id,
                    hospitalId: payload.hospitalId,
                    title:
                      `Dr. ${payload.firstName || ''} ${payload.lastName || ''}`.trim() ||
                      'Unknown Doctor',
                    content: `Specialty: ${payload.specialty || ''} Qualifications: ${payload.qualifications || ''}`,
                    metadata: payload,
                  });
                  break;

                case 'APPOINTMENT_BOOKED':
                case 'APPOINTMENT_CONFIRMED':
                case 'APPOINTMENT_UPDATED':
                  await searchService.index({
                    entityType: 'appointment',
                    entityId: payload.id,
                    hospitalId: payload.hospitalId,
                    title: `Appointment for ${payload.patientName || 'Patient'} with Dr. ${payload.doctorName || 'Doctor'}`,
                    content: `Date: ${payload.date || ''} Time: ${payload.time || ''} Status: ${event.eventType}`,
                    metadata: payload,
                  });
                  break;

                case 'VISIT_CREATED':
                case 'VISIT_UPDATED':
                  await searchService.index({
                    entityType: 'visit',
                    entityId: payload.id,
                    hospitalId: payload.hospitalId,
                    title: `Visit for Patient ${payload.patientId}`,
                    content: `Status: ${payload.status || 'Created'}. Reason: ${payload.reason || 'N/A'}`,
                    metadata: payload,
                  });
                  break;

                default:
                  if (event.eventType.startsWith('TIMELINE_') || payload.timelineEventId) {
                    await searchService.index({
                      entityType: 'timeline',
                      entityId: payload.timelineEventId || payload.id,
                      hospitalId: payload.hospitalId,
                      title: payload.title || event.eventType,
                      content: payload.description || JSON.stringify(payload),
                      metadata: payload,
                    });
                  }
                  break;
              }
            }

            // Mark as processed upon success
            await tx.$executeRaw`
            UPDATE outbox_events 
            SET processed = true, processed_at = NOW() 
            WHERE id = ${event.id}
          `;
          } catch (err: any) {
            logger.error(
              { action: 'search_index_failed', eventId: event.id, error: err.message },
              'Failed to index event',
            );
            // Increment error count on failure
            await tx.$executeRaw`
            UPDATE outbox_events 
            SET last_error = ${err.message}, error_count = COALESCE(error_count, 0) + 1 
            WHERE id = ${event.id}
          `;
          }
        }
      },
      { timeout: 15000 },
    ); // Increase transaction timeout slightly for safe indexing
  } catch (error: any) {
    logger.error({ action: 'outbox_poll_failed', error: error.message }, 'Error polling outbox');
  }
}

// Start polling
logger.info('Search Indexing Worker Started');
setInterval(processOutboxEvents, 5000);
