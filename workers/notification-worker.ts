import { prisma } from '@haspataal/db';
import { TwilioSMSAdapter, MetaWhatsAppAdapter, ResendEmailAdapter } from '@haspataal/notify';
import { ProviderFailover } from '@haspataal/notify';
import { Worker, Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const twilioAdapter = new TwilioSMSAdapter({
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  from: process.env.TWILIO_FROM || '',
});

const whatsappAdapter = new MetaWhatsAppAdapter({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
});

const emailAdapter = new ResendEmailAdapter();

const smsFailover = new ProviderFailover(twilioAdapter);
const whatsappFailover = new ProviderFailover(whatsappAdapter);
const emailFailover = new ProviderFailover(emailAdapter);

void [smsFailover, whatsappFailover, emailFailover];

const smsQueue = new Queue('sms-notifications', { connection });
const whatsappQueue = new Queue('whatsapp-notifications', { connection });
const emailQueue = new Queue('email-notifications', { connection });

function createWorker(queueName: string, adapter: any) {
  return new Worker(
    queueName,
    async (job) => {
      const { notificationId } = job.data as { notificationId: string };
      const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!notification) return { success: false, error: 'Notification not found' };

      const result = await adapter.deliver(notification);

      if (result.success) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT', sentAt: new Date() },
        });
        await prisma.notificationDelivery.create({
          data: {
            notificationId,
            channel: adapter.channel,
            provider: adapter.constructor.name,
            status: 'SENT',
            providerRef: result.messageId,
          },
        });
      } else {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'FAILED', failureReason: result.error, failedAt: new Date() },
        });
        await prisma.notificationDelivery.create({
          data: {
            notificationId,
            channel: adapter.channel,
            provider: adapter.constructor.name,
            status: 'FAILED',
            error: result.error,
          },
        });
      }
      return result;
    },
    { connection, concurrency: 10 },
  );
}

const workers = [
  createWorker('sms-notifications', twilioAdapter),
  createWorker('whatsapp-notifications', whatsappAdapter),
  createWorker('email-notifications', emailAdapter),
  createWorker('push-notifications', {
    channel: 'PUSH',
    deliver: async (_n: unknown) => ({ success: true, messageId: 'push-mock' }),
  }),
  createWorker('in-app-notifications', {
    channel: 'IN_APP',
    deliver: async (_n: unknown) => ({ success: true, messageId: 'inapp-mock' }),
  }),
];

const retryWorker = new Worker(
  'notification-retry',
  async (job) => {
    const { notificationId } = job.data;
    const n = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n) return;
    if (n.channel === 'SMS') await smsQueue.add('retry', n);
    if (n.channel === 'WHATSAPP') await whatsappQueue.add('retry', n);
    if (n.channel === 'EMAIL') await emailQueue.add('retry', n);
  },
  { connection },
);

process.stdout.write('[Worker] Notification workers started\n');
process.on('SIGINT', async () => {
  await Promise.all(workers.map((w) => w.close()));
  await retryWorker.close();
  process.exit(0);
});
