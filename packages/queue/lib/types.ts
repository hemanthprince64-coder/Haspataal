export interface QueueService {
  addJob(queueName: string, jobName: string, data: any, options?: any): Promise<any>;
  registerWorker(queueName: string, handler: (data: any) => Promise<void>, options?: any): Promise<any>;
  close(): Promise<void>;
}
