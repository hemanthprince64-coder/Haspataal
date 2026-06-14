import { QueueService } from '../types';

export class InProcessQueueAdapter implements QueueService {
  private workers = new Map<string, (data: any) => Promise<void>>();
  private closed = false;

  async addJob(queueName: string, jobName: string, data: any, options?: any): Promise<any> {
    if (this.closed) {
      throw new Error('Queue service is closed');
    }
    console.log(`[InProcessQueue] Job added to queue "${queueName}" [JobName: ${jobName}]`);
    
    // Execute asynchronously
    setTimeout(async () => {
      const handler = this.workers.get(queueName);
      if (handler) {
        try {
          console.log(`[InProcessQueue] Executing job "${jobName}" on queue "${queueName}"`);
          await handler(data);
          console.log(`[InProcessQueue] Job "${jobName}" on queue "${queueName}" completed successfully`);
        } catch (err) {
          console.error(`[InProcessQueue] Job "${jobName}" on queue "${queueName}" failed:`, err);
        }
      } else {
        // Fallback to default in-process handlers for Haspataal queues
        console.log(`[InProcessQueue] Using default in-process handler for queue "${queueName}"`);
        try {
          if (queueName === 'notifications') {
            const { type, to, message, templateId } = data || {};
            console.log(`[InProcessQueue/Notifications] [${type || 'sms'}] Sending to ${to || 'patient'}: "${message || templateId || ''}"`);
          } else if (queueName === 'reports') {
            console.log(`[InProcessQueue/Reports] Generating daily report for data:`, JSON.stringify(data));
          } else if (queueName === 'cleanup') {
            console.log(`[InProcessQueue/Cleanup] Running appointment archive/cleanup...`);
          } else {
            console.warn(`[InProcessQueue] No handler registered for queue: ${queueName}`);
          }
        } catch (err) {
          console.error(`[InProcessQueue/DefaultHandler] Error executing default job for "${queueName}":`, err);
        }
      }
    }, 0);

    return { id: `in-proc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` };
  }

  async registerWorker(queueName: string, handler: (data: any) => Promise<void>, options?: any): Promise<any> {
    this.workers.set(queueName, handler);
    console.log(`[InProcessQueue] Registered worker for queue: ${queueName}`);
    return { name: queueName };
  }

  async close(): Promise<void> {
    this.closed = true;
    this.workers.clear();
    console.log('[InProcessQueue] Closed in-process queue service');
  }
}
