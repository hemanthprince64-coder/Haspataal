import { Pool } from 'pg';
import { EventService } from './event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class PrescriptionService {
  public static async createPrescription(hospitalId: string, doctorId: string, payload: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      // 1. Save to DB (mocking Prescription table insert)
      const res = await client.query(
        `INSERT INTO "Prescription" (hospital_id, doctor_id, patient_id, diagnosis, advice, items)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [hospitalId, doctorId, payload.patient_id, payload.diagnosis, payload.advice, JSON.stringify(payload.medicines)]
      );

      const prescriptionId = res.rows[0].id;

      // 2. Emit event (Pharmacy deducts stock, analytics tracks adoption)
      await EventService.publish('doctor_prescribes', {
        prescription_id: prescriptionId,
        doctor_id: doctorId,
        patient_id: payload.patient_id,
        diagnosis: payload.diagnosis,
        items: payload.medicines
      }, hospitalId, payload.patient_id);

      await client.query('COMMIT');
      return { success: true, prescription_id: prescriptionId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public static async generatePDF(prescriptionId: string) {
    // Integration point for puppeteer or react-pdf/renderer
    return `https://mock.url/prescription_${prescriptionId}.pdf`;
  }
}
