/* eslint-disable */
import { getQueueService } from '@haspataal/queue';

const queueService = getQueueService();

export const notificationQueue = 'notifications';
export const billingQueue = 'billing';

export const addJob = async (queue: string | any, name: string, data: unknown) => {
  const queueName = typeof queue === 'string' ? queue : (queue?.name || 'notifications');
  return await queueService.addJob(queueName, name, data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};

export async function closeQueues() {
  await queueService.close();
}

