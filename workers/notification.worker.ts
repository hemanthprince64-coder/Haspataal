import { prisma } from '@haspataal/db';
import { TwilioSMSAdapter, MetaWhatsAppAdapter, ResendEmailAdapter } from '@haspataal/notify';
import { ProviderFailover, NotificationCommandHandler } from '@haspataal/notify';
import { Worker, Queue } from 'bullmq';
import { eventBus } from '@haspataal/events';
import { v4 as uuidv4 } from 'uuid';
import logger from '../apps/patient-portal/lib/logger';

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

      // Optional: Check scheduledAt
      if (notification.scheduledAt && new Date() < notification.scheduledAt) {
        console.log(`[NotificationWorker] Job ${job.id} is scheduled for future. Skipping for now.`);
        throw new Error('Scheduled for future'); // Triggers BullMQ backoff
      }

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
        
        // Emit delivery success
        await eventBus.publish({
          id: uuidv4(),
          type: 'NOTIFICATION_DELIVERED',
          version: 1,
          eventVersion: 1,
          schemaVersion: 1,
          aggregateId: notificationId,
          aggregateType: 'Notification',
          occurredAt: new Date(),
          hospitalId: notification.hospitalId,
          payload: { notificationId, channel: adapter.channel }
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
        
        // Emit delivery failure for rules engine to escalate
        await eventBus.publish({
          id: uuidv4(),
          type: 'NOTIFICATION_FAILED',
          version: 1,
          eventVersion: 1,
          schemaVersion: 1,
          aggregateId: notificationId,
          aggregateType: 'Notification',
          occurredAt: new Date(),
          hospitalId: notification.hospitalId,
          payload: { notificationId, error: result.error, channel: adapter.channel }
        });
      }
      return result;
    },
    { connection, concurrency: 10 },
  );
}

export const workers = [
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

export const retryWorker = new Worker(
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

// ─────────────────────────────────────────────────────────────
// EVENT BUS SUBSCRIBER
// ─────────────────────────────────────────────────────────────

const commandHandler = new NotificationCommandHandler();

// Listen to direct notification triggers from EventBus if any system components emit them directly
eventBus.subscribe('TRIGGER_NOTIFICATION', async (event) => {
  try {
    const payload = event.payload as any;
    const command = {
      commandId: uuidv4(),
      commandVersion: 1,
      target: 'notification',
      tenantContext: { hospitalId: event.hospitalId || 'system', branchId: 'default' },
      actorContext: { createdBy: event.actor?.id || 'SYSTEM', actorType: 'SYSTEM' },
      correlationId: event.correlationId || uuidv4(),
      idempotencyKey: `notify-${event.id}`,
      occurredAt: new Date().toISOString(),
      payload: {
        hospitalId: event.hospitalId,
        patientId: payload.patientId,
        doctorId: payload.doctorId,
        templateId: payload.templateId,
        priority: payload.priority || 'NORMAL',
        recipient: payload.recipient,
        variables: payload.variables
      }
    };
    await commandHandler.handleSendNotification(command);
  } catch (err: any) {
    logger.error({ action: 'notification_trigger_failed', error: err.message }, 'Failed to handle notification trigger');
  }
});

process.stdout.write('[Notification Worker] Started - BullMQ Processors + EventBus Adapter\n');

process.on('SIGINT', async () => {
  await Promise.all(workers.map((w) => w.close()));
  await retryWorker.close();
  process.exit(0);
});
