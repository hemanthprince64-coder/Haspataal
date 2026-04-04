import { prisma } from '../util/prisma-singleton';
import { notificationQueue, addJob } from './queues';
import { registerWorker } from '../util/worker-lifecycle';

/**
 * The Relay: Polls outbox_events and pushes them to BullMQ
 * Ensures 'Exactly-Once' or 'At-Least-Once' delivery guarantee
 */
async function processOutbox() {
  const events = await prisma.outboxEvent.findMany({
    where: { processed: false },
    take: 50,
    orderBy: { createdAt: 'asc' }
  });

  for (const event of events) {
    try {
      // 1. Map event type to correct BullMQ queue/job
      if (event.eventType === 'APPOINTMENT_BOOKED') {
        await addJob(notificationQueue, 'send_sms', event.payload);
      }

      // 2. Transactional Relay to Permanent Logs (Regulatory Compliance)
      await prisma.$transaction([
        prisma.eventLog.create({
          data: {
            eventType: event.eventType,
            payload: event.payload
          }
        }),
        prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            processed: true, 
            processedAt: new Date() 
          }
        })
      ]);
      
      console.log(`Relayed event: ${event.id}`);
    } catch (error) {
      console.error(`Failed to relay event ${event.id}:`, error);
      
      // Update error count for dead-letter handling
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { 
          errorCount: { increment: 1 },
          lastError: (error as Error).message
        }
      });
    }
  }
}

// Register with WorkerLifecycle for graceful SIGTERM shutdown (M5 Fix)
registerWorker('outbox-worker', setInterval(processOutbox, 5000));
