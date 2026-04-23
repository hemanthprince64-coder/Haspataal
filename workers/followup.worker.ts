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
        [tomorrowStr]
      );

      for (const row of dueRes.rows) {
        // Emit a generic notification event. Phase 8 picks this up.
        await EventService.publish('notification_queued', {
          type: 'followup_reminder',
          followup_id: row.id
        }, row.hospital_id, row.patient_id);
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
        [yesterdayStr]
      );

      for (const row of missedRes.rows) {
        await EventService.publish('followup_missed', {
          followup_id: row.id,
          care_pathway: row.care_pathway
        }, row.hospital_id, row.patient_id);
        
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

  private static async checkChronicEscalation(client: any, hospitalId: string, patientId: string) {
    const res = await client.query(
      `SELECT count(*) FROM "FollowUp" 
       WHERE hospital_id=$1 AND patient_id=$2 AND care_pathway='CHRONIC_DISEASE' AND status='missed'`,
      [hospitalId, patientId]
    );

    if (parseInt(res.rows[0].count, 10) >= 2) {
      // Alert treating doctor
      await EventService.publish('chronic_escalation_alert', {
        reason: 'Missed 2 chronic follow-ups'
      }, hospitalId, patientId);
    }
  }
}
