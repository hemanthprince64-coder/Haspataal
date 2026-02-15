import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../lib/prisma';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

const reportWorker = new Worker('reports', async job => {
    console.log(`Processing report job ${job.id} of type ${job.name}`);

    if (job.name === 'daily-hospital-report') {
        const { hospitalId } = job.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Aggregate Stats
        const visitCount = await prisma.visit.count({
            where: {
                hospitalId,
                createdAt: { gte: today }
            }
        });

        const appointmentCount = await prisma.appointment.count({
            where: {
                doctor: { hospitalId: hospitalId },
                date: { gte: today }
            }
        });

        // 2. Log or Store Report (For MVP just log)
        console.log(`[REPORT] Hospital ${hospitalId} | Visits: ${visitCount} | Appts: ${appointmentCount}`);

        // In real app: Email this to hospital admin or store in specific Report table
        return { hospitalId, visitCount, appointmentCount, generatedAt: new Date() };
    }
}, { connection });

reportWorker.on('completed', job => {
    console.log(`Report job ${job.id} completed!`);
});

reportWorker.on('failed', (job, err) => {
    console.error(`Report job ${job.id} failed: ${err.message}`);
});
