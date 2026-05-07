import { prisma } from '../util/prisma-singleton';
import { registerWorker } from '../util/worker-lifecycle';

/**
 * Operational Cleanup Service
 * Prevents the database from becoming a bottleneck by purging old telemetry/outbox data
 */
export async function runOperationalCleanup() {
  console.log('--- STARTING OPERATIONAL CLEANUP ---');

  // 1. Purge Processed Outbox Events (older than 7 days)
  const outboxPurge = await prisma.$executeRaw`
    DELETE FROM outbox_events 
    WHERE processed = TRUE 
    AND created_at < NOW() - INTERVAL '7 days'
  `;
  console.log(`Cleaned up ${outboxPurge} processed outbox events.`);

  // 2. Archive/Cleanup Old Draft Slots (unsold slots in the past)
  const slotPurge = await prisma.$executeRaw`
    DELETE FROM doctor_slots 
    WHERE start_time < NOW() - INTERVAL '30 days'
    AND id NOT IN (SELECT slot_id FROM appointments)
  `;
  console.log(`Cleaned up ${slotPurge} historical unsold slots.`);

  console.log('--- CLEANUP COMPLETE ---');
}

// Register with WorkerLifecycle for graceful SIGTERM shutdown (M5 Fix)
registerWorker('cleanup-service', setInterval(runOperationalCleanup, 24 * 60 * 60 * 1000));
