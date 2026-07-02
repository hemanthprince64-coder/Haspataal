import { SearchService } from '@haspataal/search/src/application/services/search-service';
import { PostgresSearchProvider } from '@haspataal/search/src/infrastructure/providers/postgres-provider';
import { PrismaClient } from '@prisma/client';

import logger from '../apps/patient-portal/lib/logger';

const prisma = new PrismaClient();
const provider = new PostgresSearchProvider(prisma as any);
const searchService = new SearchService(provider);

async function processOutboxEvents() {
  // Use a simple polling mechanism with a transaction to claim events
  const BATCH_SIZE = 50;

  try {
    const eventsToProcess = await prisma.$transaction(async (tx) => {
      // Find unprocessed events
      const events = await tx.outboxEvent.findMany({
        where: { processed: false },
        orderBy: { createdAt: 'asc' },
        take: BATCH_SIZE,
      });

      if (events.length === 0) return [];

      // Mark them as processed immediately to prevent concurrent polling issues
      await tx.outboxEvent.updateMany({
        where: { id: { in: events.map((e) => e.id) } },
        data: { processed: true },
      });

      return events;
    });

    for (const event of eventsToProcess) {
      const payload = event.payload as Record<string, any>;

      try {
        switch (event.eventType) {
          case 'PATIENT_REGISTERED':
          case 'PATIENT_UPDATED':
            await searchService.index({
              entityType: 'patient',
              entityId: payload.id || event.aggregateId,
              hospitalId: payload.hospitalId,
              title:
                `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Unknown Patient',
              content: `Phone: ${payload.phone || ''} Gender: ${payload.gender || ''}`,
              metadata: payload,
            });
            break;

          case 'DOCTOR_ADDED':
          case 'DOCTOR_REGISTERED':
            await searchService.index({
              entityType: 'doctor',
              entityId: payload.id || event.aggregateId,
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
            await searchService.index({
              entityType: 'appointment',
              entityId: payload.id || event.aggregateId,
              hospitalId: payload.hospitalId,
              title: `Appointment for ${payload.patientName || 'Patient'} with Dr. ${payload.doctorName || 'Doctor'}`,
              content: `Date: ${payload.date || ''} Time: ${payload.time || ''} Status: ${event.eventType}`,
              metadata: payload,
            });
            break;

          case 'VISIT_CREATED':
            await searchService.index({
              entityType: 'visit',
              entityId: payload.id || event.aggregateId,
              hospitalId: payload.hospitalId,
              title: `Visit for Patient ${payload.patientId}`,
              content: `Status: Created. Reason: ${payload.reason || 'N/A'}`,
              metadata: payload,
            });
            break;

          // Catch-all for timeline events to ensure unified coverage
          default:
            if (event.eventType.startsWith('TIMELINE_') || payload.timelineEventId) {
              await searchService.index({
                entityType: 'timeline',
                entityId: payload.timelineEventId || event.aggregateId,
                hospitalId: payload.hospitalId,
                title: payload.title || event.eventType,
                content: payload.description || JSON.stringify(payload),
                metadata: payload,
              });
            }
            break;
        }
      } catch (err: any) {
        logger.error(
          { action: 'search_index_failed', eventId: event.id, error: err.message },
          'Failed to index event',
        );
        // Record failure in outbox
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { lastError: err.message, processed: false },
        });
      }
    }
  } catch (error: any) {
    logger.error({ action: 'outbox_poll_failed', error: error.message }, 'Error polling outbox');
  }
}

// Start polling
logger.info('Search Indexing Worker Started');
setInterval(processOutboxEvents, 5000);
