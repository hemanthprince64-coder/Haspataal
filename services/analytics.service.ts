import { Pool } from 'pg';
import { NotificationService } from './notification.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class AnalyticsService {
  /**
   * Subscribes to all events and updates materialized analytics tables.
   * This would typically be called from a Redis stream consumer worker.
   */
  public static async processEvent(event: any) {
    const { event_type, hospital_id, metadata, timestamp } = event;
    const date = new Date(timestamp).toISOString().split('T')[0];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Set RLS scope
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospital_id]);

      // Initialize the daily record if it doesn't exist
      await client.query(
        `INSERT INTO "AnalyticsDaily" (hospital_id, date)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [hospital_id, date]
      );

      switch (event_type) {
        case 'bill_paid':
          await client.query(
            `UPDATE "AnalyticsDaily" SET revenue = revenue + $1, updated_at = now()
             WHERE hospital_id = $2 AND date = $3`,
            [metadata.amount || 0, hospital_id, date]
          );
          break;

        case 'patient_visited':
        case 'patient_admitted':
          await client.query(
            `UPDATE "AnalyticsDaily" SET patient_count = patient_count + 1, updated_at = now()
             WHERE hospital_id = $2 AND date = $3`,
            [hospital_id, date]
          );
          break;

        case 'doctor_prescribes':
          await client.query(
            `UPDATE "AnalyticsDaily" SET prescriptions_count = prescriptions_count + 1, updated_at = now()
             WHERE hospital_id = $2 AND date = $3`,
            [hospital_id, date]
          );
          // Also track per-doctor adoption
          if (metadata.doctor_id) {
            await client.query(
              `INSERT INTO "DoctorAdoption" (hospital_id, doctor_id, date, prescriptions_count)
               VALUES ($1, $2, $3, 1)
               ON CONFLICT (hospital_id, doctor_id, date) 
               DO UPDATE SET prescriptions_count = "DoctorAdoption".prescriptions_count + 1`,
              [hospital_id, metadata.doctor_id, date]
            );
          }
          break;

        case 'followup_created':
          await client.query(
            `UPDATE "AnalyticsDaily" SET followups_scheduled = followups_scheduled + 1, updated_at = now()
             WHERE hospital_id = $2 AND date = $3`,
            [hospital_id, date]
          );
          break;

        case 'followup_completed':
          await client.query(
            `UPDATE "AnalyticsDaily" SET followups_completed = followups_completed + 1, updated_at = now()
             WHERE hospital_id = $2 AND date = $3`,
            [hospital_id, date]
          );
          break;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[AnalyticsService] Failed to update analytics', err);
    } finally {
      client.release();
    }
  }

  /**
   * Generates EOD Summary and sends via Notification Engine.
   */
  public static async sendDailySummary(hospitalId: string) {
    const date = new Date().toISOString().split('T')[0];
    const client = await pool.connect();
    
    try {
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);
      const res = await client.query(
        `SELECT * FROM "AnalyticsDaily" WHERE hospital_id = $1 AND date = $2`,
        [hospitalId, date]
      );

      if (res.rowCount > 0) {
        const stats = res.rows[0];
        await NotificationService.send({
          hospital_id: hospitalId,
          patient_id: 'SYSTEM_ADMIN', // Target is hospital admin
          template_key: 'bill_receipt', // Reuse or create new summary template
          variables: {
            patient_name: 'Admin',
            amount: stats.revenue,
            receipt_url: `Summary: ${stats.patient_count} patients, ${stats.followups_completed} followups.`
          }
        });
      }
    } finally {
      client.release();
    }
  }
}
