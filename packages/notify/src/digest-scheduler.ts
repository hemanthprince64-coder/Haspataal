import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export class DigestScheduler {
  static async scheduleDaily() {
    const queue = new Queue('digest-daily', { connection });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const delay = tomorrow.getTime() - Date.now();
    await queue.add('daily-digest', {}, { delay: Math.max(0, delay) });
  }

  static async scheduleWeekly() {
    const queue = new Queue('digest-weekly', { connection });
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    const delay = nextWeek.getTime() - Date.now();
    await queue.add('weekly-digest', {}, { delay: Math.max(0, delay) });
  }

  static async schedulePregnancy(patientId: string) {
    const queue = new Queue('digest-pregnancy', { connection });
    await queue.add('pregnancy-digest', { patientId });
  }
}
