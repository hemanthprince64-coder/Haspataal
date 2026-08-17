import { getQueueService } from '@haspataal/queue';

// getQueueService is called lazily inside each helper function

export const notificationQueue = {
  add: (name, data, options) => getQueueService().addJob('notifications', name, data, options),
};

// Helper to add jobs
export const addNotificationJob = async (type, data) => {
  return await getQueueService().addJob('notifications', type, data);
};

export const reportQueue = {
  add: (name, data, options) => getQueueService().addJob('reports', name, data, options),
};

export const cleanupQueue = {
  add: (name, data, options) => getQueueService().addJob('cleanup', name, data, options),
};

export const addReportJob = async (type, data) => {
  return await getQueueService().addJob('reports', type, data);
};

export const addCleanupJob = async (type, data) => {
  return await getQueueService().addJob('cleanup', type, data);
};

export const discoveryQueue = {
  add: (name, data, options) => getQueueService().addJob('discovery', name, data, options),
};

export const refreshSearchIndex = async (type, data) => {
  return await getQueueService().addJob('discovery', type, data);
};
