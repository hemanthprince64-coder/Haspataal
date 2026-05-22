import { Pool } from 'pg';
import { EventService } from '../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class FollowUpWorker {
  /**
   * Designed to be run nightly via cron.
   * Scans for follow-ups due tomorrow and misses.
   */
  public static async runNightlyScan() {
    console.log('[FollowUpWorker] Starting nightly scan...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Process Due Tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const dueRes = await client.query(
        `SELECT id, hospital_id, patient_id FROM "FollowUp" 
         WHERE due_date = $1 AND status = 'scheduled'`,
        [tomorrowStr],
      );

      for (const row of dueRes.rows) {
        // Emit a generic notification event. Phase 8 picks this up.
        await EventService.publish(
          'notification_queued',
          {
            type: 'followup_reminder',
            followup_id: row.id,
          },
          row.hospital_id,
          row.patient_id,
        );
      }
      console.log(`[FollowUpWorker] Queued ${dueRes.rowCount} reminders for tomorrow.`);

      // 2. Process Missed (Due yesterday, still scheduled)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const missedRes = await client.query(
        `UPDATE "FollowUp" SET status = 'missed'
         WHERE due_date <= $1 AND status = 'scheduled'
         RETURNING id, hospital_id, patient_id, care_pathway`,
        [yesterdayStr],
      );

      for (const row of missedRes.rows) {
        await EventService.publish(
          'followup_missed',
          {
            followup_id: row.id,
            care_pathway: row.care_pathway,
          },
          row.hospital_id,
          row.patient_id,
        );

        // Chronic Escalation Rule
        if (row.care_pathway === 'CHRONIC_DISEASE') {
          await this.checkChronicEscalation(client, row.hospital_id, row.patient_id);
        }
      }
      console.log(`[FollowUpWorker] Marked ${missedRes.rowCount} follow-ups as missed.`);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[FollowUpWorker] Scan failed', err);
    } finally {
      client.release();
    }
  }

  /**
   * Patched 2025-05-20: persistence → EscalationAlert table.
   * Now writes an alert record (idempotent trigger) instead of only emitting a volatile event.
   */
  private static async checkChronicEscalation(client: any, hospitalId: string, patientId: string) {
    const res = await client.query(
      `SELECT count(*) FROM "FollowUp"
       WHERE hospital_id=$1 AND patient_id=$2 AND care_pathway='CHRONIC_DISEASE' AND status='missed'`,
      [hospitalId, patientId],
    );
    const missedCount = parseInt(res.rows[0].count, 10);
    if (missedCount < 2) return;   // threshold not yet reached

    // Idempotent insert — trigger on escalation_alerts prevents duplicates at DB level
    await client.query(
      `INSERT INTO "escalation_alerts"
         (hospital_id, patient_id, doctor_id, follow_up_id, appointment_id,
          missed_count, chronic_tag, is_acknowledged, created_at, updated_at)
       SELECT
         f."hospital_id", f."patient_id",
         a."doctor_id", f."id", f."appointment_id",
         $3, 'CHRONIC_DISEASE', false, now(), now()
       FROM "FollowUp" f
       LEFT JOIN "Appointment" a ON a."id" = f."appointment_id"
       WHERE f."hospital_id" = $1 AND f."patient_id" = $2
         AND f."care_pathway" = 'CHRONIC_DISEASE' AND f."status" = 'missed'
       LIMIT 1
       ON CONFLICT ("appointment_id", "hospital_id") DO NOTHING`,
      [hospitalId, patientId, missedCount],
    );

    await EventService.publish(
      'chronic_escalation_alert',
      { reason: `Missed ${missedCount} chronic follow-ups`, missedCount },
      hospitalId,
      patientId,
    );
  }
}
