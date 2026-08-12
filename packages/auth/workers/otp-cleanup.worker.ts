import { PrismaClient } from '@haspataal/db';
import { logger } from '@haspataal/logger';

const prisma = new PrismaClient();

async function runCleanup() {
  logger.info({ action: 'otp_cleanup_started' }, 'Starting OTP cleanup job');

  try {
    const result = await prisma.otpCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info(
      { action: 'otp_cleanup_completed', deletedCount: result.count },
      `Deleted ${result.count} expired OTP records`,
    );
  } catch (error: any) {
    logger.error(
      { action: 'otp_cleanup_failed', error: error.message },
      'Failed to execute OTP cleanup job',
    );
  } finally {
    await prisma.$disconnect();
  }
}

// In a real production environment, this might be managed by a cron scheduler (like bullmq or node-cron)
// For the MVP scale, a simple setInterval or standalone cron-triggered script is sufficient.
if (require.main === module) {
  runCleanup()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error({ error: err instanceof Error ? err.message : String(err) }, 'OTP cleanup job crashed');
      process.exit(1);
    });
}

export { runCleanup };
