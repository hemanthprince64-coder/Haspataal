import { Pool } from 'pg';
import { prisma } from '@haspataal/db';
import { EventService } from '../services/event.service';
import { buildMessage } from '../templates/notification-templates';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class NotificationWorker {
  /**
   * Intended to run frequently (e.g. every minute)
   */
  public static async processQueue() {
    const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite';

    if (isSqlite) {
      try {
        const pendingNotifications = await prisma.notification.findMany({
          where: {
            status: 'PENDING',
            scheduledAt: { lte: new Date() },
          },
          take: 50,
        });

        for (const job of pendingNotifications) {
          await this.attemptSendPrisma(job);
        }
      } catch (err) {
        console.error('[NotificationWorker] SQLite processQueue error', err);
      }
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock rows for processing
      const res = await client.query(
        `SELECT id, hospital_id, patient_id, template_key, variables, channel, attempts 
         FROM "NotificationLog" 
         WHERE status = 'pending' 
           AND next_attempt_at <= now() 
         FOR UPDATE SKIP LOCKED 
         LIMIT 50`, // Batch to respect rate limits
      );

      for (const row of res.rows) {
        await this.attemptSend(client, row);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[NotificationWorker] Queue processing error', err);
    } finally {
      client.release();
    }
  }

  private static async attemptSendPrisma(job: any) {
    const { id, hospitalId, patientId, templateKey, payload, channel } = job;
    const attempts = (job.payload as any)?.attempts ?? 0;
    const currentChannel = channel === 'auto' ? 'whatsapp' : channel;

    let success = false;

    try {
      const variables = typeof payload === 'object' ? (payload as Record<string, string>) : {};
      const message = buildMessage(templateKey || '', variables);

      success = await this.mockProviderSend(currentChannel, patientId || 'unknown', message);

      if (success) {
        await prisma.notification.update({
          where: { id },
          data: {
            status: 'delivered',
            sentAt: new Date(),
          },
        });
        await EventService.publish(
          'notification_sent',
          { notification_id: id, channel: currentChannel },
          hospitalId,
          patientId,
        );
      } else {
        throw new Error('Provider rejected');
      }
    } catch (err: any) {
      const nextAttempts = attempts + 1;

      if (nextAttempts >= 3) {
        if (channel === 'auto' || currentChannel === 'whatsapp') {
          console.log(
            `[NotificationWorker] WhatsApp failed 3 times for Job ${id}. Falling back to SMS.`,
          );
          await prisma.notification.update({
            where: { id },
            data: {
              channel: 'sms',
              payload: {
                ...(typeof payload === 'object' ? (payload as any) : {}),
                attempts: 0,
              },
              scheduledAt: new Date(),
            },
          });
        } else {
          await prisma.notification.update({
            where: { id },
            data: {
              status: 'failed',
              failureReason: err.message || 'Maximum attempts reached',
            },
          });
        }
      } else {
        let delayMins = 1;
        if (nextAttempts === 2) delayMins = 5;
        if (nextAttempts === 3) delayMins = 30;

        const nextAttemptAt = new Date();
        nextAttemptAt.setMinutes(nextAttemptAt.getMinutes() + delayMins);

        await prisma.notification.update({
          where: { id },
          data: {
            payload: {
              ...(typeof payload === 'object' ? (payload as any) : {}),
              attempts: nextAttempts,
            },
            scheduledAt: nextAttemptAt,
          },
        });
      }
    }
  }

  private static async attemptSend(client: any, job: any) {
    const { id, hospital_id, patient_id, template_key, variables, channel, attempts } = job;

    // Default to WhatsApp if AUTO
    const currentChannel = channel === 'auto' ? 'whatsapp' : channel;

    let success = false;

    try {
      // Build message
      const message = buildMessage(template_key, variables);

      // Mock external provider call
      success = await this.mockProviderSend(currentChannel, patient_id, message);

      if (success) {
        // Mark delivered
        await client.query(
          `UPDATE "NotificationLog" SET status = 'delivered', delivered_at = now() WHERE id = $1`,
          [id],
        );
        await EventService.publish(
          'notification_sent',
          { notification_id: id, channel: currentChannel },
          hospital_id,
          patient_id,
        );
      } else {
        throw new Error('Provider rejected');
      }
    } catch (err) {
      const nextAttempts = attempts + 1;

      if (nextAttempts >= 3) {
        // Fallback logic
        if (channel === 'auto' || currentChannel === 'whatsapp') {
          console.log(
            `[NotificationWorker] WhatsApp failed 3 times for Job ${id}. Falling back to SMS.`,
          );
          await client.query(
            `UPDATE "NotificationLog" 
             SET channel = 'sms', attempts = 0, next_attempt_at = now() 
             WHERE id = $1`,
            [id],
          );
        } else {
          // Absolute failure
          await client.query(`UPDATE "NotificationLog" SET status = 'failed' WHERE id = $1`, [id]);
        }
      } else {
        // Exponential backoff (1m, 5m, 30m)
        let delayMins = 1;
        if (nextAttempts === 2) delayMins = 5;
        if (nextAttempts === 3) delayMins = 30;

        await client.query(
          `UPDATE "NotificationLog" 
           SET attempts = $1, next_attempt_at = now() + interval '${delayMins} minutes' 
           WHERE id = $2`,
          [nextAttempts, id],
        );
      }
    }
  }

  private static async mockProviderSend(
    channel: string,
    patientId: string,
    message: string,
  ): Promise<boolean> {
    // 90% success rate mock
    const isSuccess = Math.random() > 0.1;
    console.log(
      `[MockProvider] Sending via ${channel.toUpperCase()} to ${patientId}: "${message}" -> ${isSuccess ? 'SUCCESS' : 'FAIL'}`,
    );
    return isSuccess;
  }
}

