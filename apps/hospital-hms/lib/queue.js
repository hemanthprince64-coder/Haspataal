import { getQueueService } from '@haspataal/queue';

const queueService = getQueueService();

export const notificationQueue = {
  add: (name, data, options) => queueService.addJob('notifications', name, data, options),
};

// Helper to add jobs
export const addNotificationJob = async (type, data) => {
  return await queueService.addJob('notifications', type, data);
};

export const reportQueue = {
  add: (name, data, options) => queueService.addJob('reports', name, data, options),
};

export const cleanupQueue = {
  add: (name, data, options) => queueService.addJob('cleanup', name, data, options),
};

export const addReportJob = async (type, data) => {
  return await queueService.addJob('reports', type, data);
};

export const addCleanupJob = async (type, data) => {
  return await queueService.addJob('cleanup', type, data);
};

export const discoveryQueue = {
  add: (name, data, options) => queueService.addJob('discovery', name, data, options),
};

export const refreshSearchIndex = async (type, data) => {
  return await queueService.addJob('discovery', type, data);
};
