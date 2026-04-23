import { Pool } from 'pg';
import { EventService } from './event.service';

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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [req.hospital_id]);

      // 1. Curfew Check (10 PM to 8 AM IST)
      // We assume server is running in UTC or we do offset math. 
      // For simplicity, we'll do basic JS date hour check assuming IST server time, 
      // or explicit offset if UTC. Assuming UTC server: IST = UTC + 5:30.
      const now = new Date();
      // Simple mockup of curfew check logic:
      const currentHourUTC = now.getUTCHours();
      const currentMinUTC = now.getUTCMinutes();
      // Convert to IST
      let currentHourIST = currentHourUTC + 5;
      let currentMinIST = currentMinUTC + 30;
      if (currentMinIST >= 60) {
        currentHourIST += 1;
        currentMinIST -= 60;
      }
      currentHourIST = currentHourIST % 24;

      let nextAttemptAt = new Date();
      if (currentHourIST >= 22 || currentHourIST < 8) {
        // Curfew active. Schedule for 8:00 AM IST.
        // Fast-forward to 8AM
        let hoursToAdd = 8 - currentHourIST;
        if (hoursToAdd <= 0) hoursToAdd += 24;
        nextAttemptAt.setHours(nextAttemptAt.getHours() + hoursToAdd);
        console.log(`[NotificationService] Curfew active. Delaying send until ${nextAttemptAt.toISOString()}`);
      }

      // 2. Insert into Queue (NotificationLog)
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
          nextAttemptAt.toISOString()
        ]
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
