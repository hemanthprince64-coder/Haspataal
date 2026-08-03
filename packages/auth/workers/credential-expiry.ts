/* eslint-disable no-console */
import { prisma } from '@haspataal/db';
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(
  process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379',
);

export const expiryQueue = new Queue('credential-expiry', { connection });

const daysThreshold = 30;

export const expiryWorker = new Worker(
  'credential-expiry',
  async (job: Job) => {
    const { type, doctorId, daysRemaining } = job.data;

    switch (type) {
      case 'registration':
        console.log(`[ALERT] Doctor ${doctorId} registration expiring in ${daysRemaining} days`);
        // TODO: Send notification to doctor
        break;
      case 'certification':
        console.log(`[ALERT] Doctor ${doctorId} certification expiring in ${daysRemaining} days`);
        // TODO: Send notification to doctor
        break;
    }
  },
  { connection },
);

// Schedule daily check for expiring credentials
async function checkExpiringCredentials() {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  // Check registration expirations
  const doctorsWithExpiringReg = await prisma.doctorRegistration.findMany({
    where: {
      expiryDate: {
        gte: now,
        lte: thresholdDate,
      },
    },
    include: { doctor: true },
  });

  for (const reg of doctorsWithExpiringReg) {
    const daysRemaining = Math.ceil(
      (new Date(reg.expiryDate!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );
    await expiryQueue.add('expiry-alert', {
      type: 'registration',
      doctorId: reg.doctorId,
      daysRemaining,
    });
  }

  // Check certification expirations
  const certsExpiring = await prisma.doctorCertification.findMany({
    where: {
      expiryDate: {
        gte: now,
        lte: thresholdDate,
      },
    },
    include: { doctor: true },
  });

  for (const cert of certsExpiring) {
    const daysRemaining = Math.ceil(
      (new Date(cert.expiryDate!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );
    await expiryQueue.add('expiry-alert', {
      type: 'certification',
      doctorId: cert.doctorId,
      daysRemaining,
    });
  }

  console.log(
    `[CredentialMonitor] Checked ${doctorsWithExpiringReg.length + certsExpiring.length} expiring credentials`,
  );
}

// Run daily at 9 AM
if (require.main === module) {
  checkExpiringCredentials().catch(console.error);
}

export { checkExpiringCredentials };
