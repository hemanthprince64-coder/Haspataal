import { Pool } from 'pg';
import { EventService } from './event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class RetentionService {
  /**
   * Main consumer handler. Listens to 'patient_discharged'
   */
  public static async processDischargeEvent(event: any) {
    const { hospital_id, patient_id, metadata } = event;
    const { summary, doctor_id } = metadata;

    const summaryText = JSON.stringify(summary).toLowerCase();
    
    // Care Pathway Router
    if (summaryText.includes('delivery') || summaryText.includes('pregnancy')) {
      await this.schedulePregnancyPathway(hospital_id, patient_id, doctor_id);
    } 
    else if (summaryText.includes('vaccination') || summaryText.includes('pediatric')) {
      await this.schedulePediatricsPathway(hospital_id, patient_id, doctor_id);
    }
    else if (summaryText.includes('diabetes') || summaryText.includes('hypertension') || summaryText.includes('ckd')) {
      await this.scheduleChronicPathway(hospital_id, patient_id, doctor_id);
    }
    else {
      await this.scheduleGeneralPathway(hospital_id, patient_id, doctor_id, summaryText.includes('follow-up required'));
    }
  }

  private static async schedulePregnancyPathway(hospitalId: string, patientId: string, doctorId: string) {
    // 6 weeks of weekly check-ins
    const intervals = [7, 14, 21, 28, 35, 42];
    await this.insertFollowUps(hospitalId, patientId, doctorId, 'PREGNANCY', 'pregnancy_checkin', intervals);
  }

  private static async schedulePediatricsPathway(hospitalId: string, patientId: string, doctorId: string) {
    // Vaccination standard intervals (days): 6w, 10w, 14w
    const intervals = [42, 70, 98];
    await this.insertFollowUps(hospitalId, patientId, doctorId, 'PEDIATRICS', 'vaccination', intervals);
  }

  private static async scheduleChronicPathway(hospitalId: string, patientId: string, doctorId: string) {
    // Monthly follow-up for 6 months (approx 30 days)
    const intervals = [30, 60, 90, 120, 150, 180];
    await this.insertFollowUps(hospitalId, patientId, doctorId, 'CHRONIC_DISEASE', 'chronic_review', intervals);
  }

  private static async scheduleGeneralPathway(hospitalId: string, patientId: string, doctorId: string, needs30Day: boolean) {
    const intervals = needs30Day ? [7, 30] : [7];
    await this.insertFollowUps(hospitalId, patientId, doctorId, 'GENERAL', 'general_review', intervals);
  }

  private static async insertFollowUps(hospitalId: string, patientId: string, doctorId: string, pathway: string, type: string, daysOut: number[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      for (const days of daysOut) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        const dateStr = dueDate.toISOString().split('T')[0];

        const res = await client.query(
          `INSERT INTO "FollowUp" (hospital_id, patient_id, doctor_id, due_date, type, care_pathway)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [hospitalId, patientId, doctorId, dateStr, type, pathway]
        );

        await EventService.publish('followup_created', {
          followup_id: res.rows[0].id,
          due_date: dateStr,
          care_pathway: pathway
        }, hospitalId, patientId);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[RetentionService] Failed to schedule pathway', err);
    } finally {
      client.release();
    }
  }

  public static async markCompleted(hospitalId: string, followupId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      const res = await client.query(
        `UPDATE "FollowUp" SET status='completed' WHERE id=$1 AND hospital_id=$2 RETURNING patient_id`,
        [followupId, hospitalId]
      );

      if (res.rowCount > 0) {
        await EventService.publish('followup_completed', { followup_id: followupId }, hospitalId, res.rows[0].patient_id);
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
