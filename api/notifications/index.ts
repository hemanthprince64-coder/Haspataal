import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { EventService } from '../../services/event.service';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Webhook for External Providers (e.g., Meta/WhatsApp Business API)
 * Does NOT use tenantMiddleware because it's called by an external service without a JWT.
 */
router.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  const { notification_id, status, error_code } = req.body;

  if (!notification_id || !status) {
    return res.status(400).send('Bad Request');
  }

  const client = await pool.connect();
  try {
    if (status === 'failed') {
      // Fetch the log to attempt fallback or retry
      const logRes = await client.query(
        `SELECT hospital_id, patient_id, attempts, channel 
         FROM "NotificationLog" WHERE id = $1`,
        [notification_id]
      );

      if (logRes.rowCount > 0) {
        const log = logRes.rows[0];
        
        // If meta throws a hard block (e.g. number not on WA), we can immediately fallback to SMS
        if (error_code === '131026') { 
          await client.query(
            `UPDATE "NotificationLog" SET channel='sms', attempts=0, next_attempt_at=now() WHERE id=$1`,
            [notification_id]
          );
        } else {
          // Otherwise, let the worker retry logic handle it next tick
          await client.query(
            `UPDATE "NotificationLog" SET status='pending', next_attempt_at=now() WHERE id=$1`,
            [notification_id]
          );
        }
      }
    } else if (status === 'delivered' || status === 'read') {
      const logRes = await client.query(
        `UPDATE "NotificationLog" SET status=$1 WHERE id=$2 RETURNING hospital_id, patient_id`,
        [status, notification_id]
      );
      if (logRes.rowCount > 0) {
        await EventService.publish('notification_delivered', { notification_id }, logRes.rows[0].hospital_id, logRes.rows[0].patient_id);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[WhatsApp Webhook] Error', err);
    res.status(500).send('Internal Error');
  } finally {
    client.release();
  }
});

export default router;
