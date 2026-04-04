import { prisma } from '../util/prisma-singleton';
import { registerWorker } from '../util/worker-lifecycle';

/**
 * Data Integrity Checker (Gap 5 Fix)
 * Periodic verification of system constraints that may bypass simple checks
 */
export async function verifyDataIntegrity() {
  console.log('--- STARTING DATA INTEGRITY AUDIT ---');

  // 1. Check for Overbooked Slots (Safety Gap 1 & 2 Fail-safe)
  const overbooked = await prisma.$queryRaw`
    SELECT a.slot_time, a.doctor_id, COUNT(*) as booking_count, s.capacity
    FROM appointments a
    JOIN doctor_slots s ON (a.doctor_id = s.doctor_id AND a.slot_time = s.start_time)
    WHERE a.status NOT IN ('cancelled', 'no_show')
    GROUP BY a.slot_time, a.doctor_id, s.capacity
    HAVING COUNT(*) > s.capacity
  `;

  if (Array.isArray(overbooked) && overbooked.length > 0) {
    console.error('CRITICAL: Overbooked slots detected!', overbooked);
    // Trigger AlertManager / Outbox Event
  }

  // 2. Check for Inconsistent Outbox States
  const stuckOutbox = await prisma.outboxEvent.count({
    where: {
      processed: false,
      createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) }
    }
  });

  if (stuckOutbox > 0) {
    console.warn(`Integrity Warning: ${stuckOutbox} outbox events are stuck.`);
  }

  console.log('--- INTEGRITY AUDIT COMPLETE ---');
}

// Register with WorkerLifecycle for graceful SIGTERM shutdown (M5 Fix)
registerWorker('integrity-checker', setInterval(verifyDataIntegrity, 6 * 60 * 60 * 1000));
