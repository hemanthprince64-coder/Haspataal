import { Pool } from 'pg';
import { EventService } from '../services/event.service';
import { buildMessage } from '../templates/notification-templates';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class NotificationWorker {
  /**
   * Intended to run frequently (e.g. every minute)
   */
  public static async processQueue() {
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
         LIMIT 50` // Batch to respect rate limits
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
          [id]
        );
        await EventService.publish('notification_sent', { notification_id: id, channel: currentChannel }, hospital_id, patient_id);
      } else {
        throw new Error('Provider rejected');
      }

    } catch (err) {
      const nextAttempts = attempts + 1;
      
      if (nextAttempts >= 3) {
        // Fallback logic
        if (channel === 'auto' || currentChannel === 'whatsapp') {
          console.log(`[NotificationWorker] WhatsApp failed 3 times for Job ${id}. Falling back to SMS.`);
          await client.query(
            `UPDATE "NotificationLog" 
             SET channel = 'sms', attempts = 0, next_attempt_at = now() 
             WHERE id = $1`,
            [id]
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
          [nextAttempts, id]
        );
      }
    }
  }

  private static async mockProviderSend(channel: string, patientId: string, message: string): Promise<boolean> {
    // 90% success rate mock
    const isSuccess = Math.random() > 0.1;
    console.log(`[MockProvider] Sending via ${channel.toUpperCase()} to ${patientId}: "${message}" -> ${isSuccess ? 'SUCCESS' : 'FAIL'}`);
    return isSuccess;
  }
}
