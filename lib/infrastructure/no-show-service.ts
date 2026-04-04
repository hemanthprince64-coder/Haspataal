import { prisma } from '../util/prisma-singleton';
import { addMinutes } from 'date-fns';
import { registerWorker } from '../util/worker-lifecycle';

/**
 * No-Show Recovery Service
 * Identifies patients who haven't checked in and frees up resources
 */
export async function recoverNoShows() {
  const gracePeriodMinutes = 15;
  const threshold = addMinutes(new Date(), -gracePeriodMinutes);

  // Find appointments that are still 'booked' but past their start time + grace period
  const potentialNoShows = await prisma.appointment.findMany({
    where: {
      status: 'BOOKED',
      slotTime: { lt: threshold }
    }
  });

  for (const appointment of potentialNoShows) {
    await prisma.$transaction(async (tx) => {
      // 1. Mark as No-Show
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: 'NO_SHOW' as any }
      });

      // 2. Log for Audit
      await tx.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'MARK_NO_SHOW',
          entity: 'appointment',
          entityId: appointment.id,
        }
      });
      
      console.log(`Recovered no-show: ${appointment.id}`);
    });
  }
}

// Register with WorkerLifecycle for graceful SIGTERM shutdown (M5 Fix)
registerWorker('no-show-service', setInterval(recoverNoShows, 15 * 60 * 1000));
