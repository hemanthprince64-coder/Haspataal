import { prisma } from '@haspataal/db';
import { RuleRegistry } from '@haspataal/rules';
import { ExecutionEngine } from '@haspataal/rules';
import { Queue, Worker, Job } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const rulesQueue = new Queue('rules-execution', { connection });
export const schedulerQueue = new Queue('rules-scheduler', { connection });

const registry = new RuleRegistry(prisma as any);
const engine = new ExecutionEngine(prisma as any);

export const rulesWorker = new Worker(
  'rules-execution',
  async (job: Job) => {
    const { eventType, event, patientId, hospitalId } = job.data;

    const rules = await registry.findByEvent(eventType, hospitalId);

    for (const rule of rules) {
      await engine.execute(rule, {
        event,
        patientId,
        hospitalId,
        timestamp: new Date(),
      });
    }
  },
  { connection, concurrency: 5 },
);

export const schedulerWorker = new Worker(
  'rules-scheduler',
  async (job: Job) => {
    const { ruleId, patientId, hospitalId } = job.data;

    const rule = await registry.findById(ruleId);
    if (!rule?.isActive) return;

    await engine.execute(rule, {
      patientId,
      hospitalId,
      timestamp: new Date(),
    });
  },
  { connection, concurrency: 3 },
);

rulesWorker.on('completed', (job) => {
  console.log(`[RulesWorker] Completed job ${job.id}`);
});

rulesWorker.on('failed', (job, err) => {
  console.error(`[RulesWorker] Failed job ${job?.id}:`, err.message);
});
