import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../lib/prisma';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

const cleanupWorker = new Worker('cleanup', async job => {
    console.log(`Processing cleanup job ${job.id}`);

    if (job.name === 'archive-old-appointments') {
        // Archive appointments older than 90 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        const oldAppointments = await prisma.appointment.findMany({
            where: {
                date: { lt: cutoffDate }
            }
        });

        if (oldAppointments.length === 0) {
            console.log('No old appointments to archive.');
            return { archivedCount: 0 };
        }

        // In a real app, move to 'ArchivedAppointment' table. 
        // For MVP, we'll just log and maybe mark a status if field existed, or delete.
        // Let's just log for safety in this demo.
        console.log(`Found ${oldAppointments.length} appointments older than 90 days.`);

        // Example: await prisma.appointment.deleteMany({ where: { date: { lt: cutoffDate } } });

        return { archivedCount: oldAppointments.length };
    }
}, { connection });

cleanupWorker.on('completed', job => {
    console.log(`Cleanup job ${job.id} completed!`);
});

cleanupWorker.on('failed', (job, err) => {
    console.error(`Cleanup job ${job.id} failed: ${err.message}`);
});
