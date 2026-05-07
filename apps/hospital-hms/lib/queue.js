import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let connection;
const queues = new Map();

const getRedisUrl = () => process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

const getConnection = () => {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error('REDIS_URL or UPSTASH_REDIS_REST_URL must be set before using background queues');
  }

  if (!connection) {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
  }

  return connection;
};

const getQueue = (name) => {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: getConnection() }));
  }

  return queues.get(name);
};

export const notificationQueue = {
  add: (...args) => getQueue('notifications').add(...args),
};

// Helper to add jobs
export const addNotificationJob = async (type, data) => {
  return await notificationQueue.add(type, data);
};

export const reportQueue = {
  add: (...args) => getQueue('reports').add(...args),
};

export const cleanupQueue = {
  add: (...args) => getQueue('cleanup').add(...args),
};

export const addReportJob = async (type, data) => {
  return await reportQueue.add(type, data);
};

export const addCleanupJob = async (type, data) => {
  return await cleanupQueue.add(type, data);
};
