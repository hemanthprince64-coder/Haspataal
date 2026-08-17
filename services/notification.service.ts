import { Pool } from 'pg';
import { prisma } from '@haspataal/db';
import { buildMessage } from '../templates/notification-templates';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface NotificationRequest {
  hospital_id: string;
  patient_id: string;
  template_key: string;
  variables: Record<string, string>;
  channel_preference?: 'whatsapp' | 'sms' | 'push' | 'auto';
}

export class NotificationService {
  /**
   * Enqueues a notification, respecting the 10pm-8am curfew.
   */
  public static async send(req: NotificationRequest) {
    const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite';

    // 1. Curfew Check (10 PM to 8 AM IST)
    const now = new Date();
    const currentHourUTC = now.getUTCHours();
    const currentMinUTC = now.getUTCMinutes();
    let currentHourIST = currentHourUTC + 5;
    let currentMinIST = currentMinUTC + 30;
    if (currentMinIST >= 60) {
      currentHourIST += 1;
      currentMinIST -= 60;
    }
    currentHourIST = currentHourIST % 24;

    const nextAttemptAt = new Date();
    if (currentHourIST >= 22 || currentHourIST < 8) {
      let hoursToAdd = 8 - currentHourIST;
      if (hoursToAdd <= 0) hoursToAdd += 24;
      nextAttemptAt.setHours(nextAttemptAt.getHours() + hoursToAdd);
      console.log(
        `[NotificationService] Curfew active. Delaying send until ${nextAttemptAt.toISOString()}`,
      );
    }

    if (isSqlite) {
      try {
        const body = buildMessage(req.template_key, req.variables);
        const res = await prisma.notification.create({
          data: {
            hospitalId: req.hospital_id,
            patientId: req.patient_id,
            channel: req.channel_preference || 'auto',
            templateId: req.template_key,
            recipient: 'Patient',
            body,
            status: 'PENDING',
            scheduledAt: nextAttemptAt,
            variables: req.variables,
          },
        });
        return { success: true, notification_id: res.id };
      } catch (err) {
        console.error('[NotificationService] SQLite enqueue failed:', err);
        throw err;
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [req.hospital_id]);

      // Insert into Queue (NotificationLog)
      const res = await client.query(
        `
        INSERT INTO "NotificationLog" 
          (hospital_id, patient_id, template_key, variables, channel, status, next_attempt_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
        RETURNING id
        `,
        [
          req.hospital_id,
          req.patient_id,
          req.template_key,
          JSON.stringify(req.variables),
          req.channel_preference || 'auto',
          nextAttemptAt.toISOString(),
        ],
      );

      await client.query('COMMIT');
      return { success: true, notification_id: res.rows[0].id };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

