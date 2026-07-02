import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

export class SlotCleanupWorker {
  /**
   * Releases AWAITING_PAYMENT appointments that are older than the configured timeout.
   * Designed to be run every 10 minutes via cron.
   */
  public static async releaseStaleSlots(timeoutMinutes = 10) {
    logger.info(`[SlotCleanupWorker] Scanning for slots stale > ${timeoutMinutes}m...`);
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const staleAppointments = await prisma.appointment.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        createdAt: { lt: cutoff },
      },
      include: {
        doctor: { select: { id: true, fullName: true } },
        patient: { select: { id: true, name: true } },
      },
      take: 100,
    });

    let released = 0;
    for (const apt of staleAppointments) {
      try {
        await prisma.appointment.update({
          where: { id: apt.id },
          data: { status: 'CANCELLED' },
        });

        logger.info(
          `[SlotCleanupWorker] Released stale slot: appointment ${apt.id} (doctor: ${apt.doctorId})`,
        );
        released++;
      } catch (error) {
        logger.error(
          `[SlotCleanupWorker] Failed to release appointment ${apt.id}: ${(error as any).message || String(error)}`,
        );
      }
    }

    logger.info(`[SlotCleanupWorker] Released ${released} stale slots.`);
    return released;
  }
}
