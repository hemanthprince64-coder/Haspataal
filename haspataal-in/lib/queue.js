import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue('notifications', { connection });

// Helper to add jobs
export const addNotificationJob = async (type, data) => {
    return await notificationQueue.add(type, data);
};
