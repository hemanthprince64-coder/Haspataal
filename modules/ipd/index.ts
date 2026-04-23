import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { EventService } from '../../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Types ---
export interface IPDAdmitPayload {
  patient_id: string;
  admitting_doctor_id: string;
  ward: string;
  bed_number: string;
  reason: string;
}

// --- Service ---
export class IPDService {
  public static async admitPatient(hospitalId: string, payload: IPDAdmitPayload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      // 1. Create IPD Admission Record
      const res = await client.query(
        `INSERT INTO "IPD_Admission" (hospital_id, patient_id, doctor_id, ward, bed_number, reason, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'admitted') RETURNING id`,
        [hospitalId, payload.patient_id, payload.admitting_doctor_id, payload.ward, payload.bed_number, payload.reason]
      );
      
      const admissionId = res.rows[0].id;

      // 2. Update Bed Status (Assume a Bed table exists)
      // await client.query(`UPDATE "Bed" SET status='occupied' WHERE hospital_id=$1 AND ward=$2 AND bed_number=$3`, ...);

      // 3. Emit Event
      await EventService.publish('patient_admitted', { admission_id: admissionId, ...payload }, hospitalId, payload.patient_id);

      await client.query('COMMIT');
      return { admission_id: admissionId, status: 'admitted' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public static async dischargePatient(hospitalId: string, admissionId: string, summary: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      // 1. Mark Discharged
      const res = await client.query(
        `UPDATE "IPD_Admission" SET status='discharged', discharged_at=now() WHERE id=$1 AND hospital_id=$2 RETURNING patient_id`,
        [admissionId, hospitalId]
      );

      const patientId = res.rows[0].patient_id;

      // 2. Emit Event
      await EventService.publish('patient_discharged', { admission_id: admissionId, summary }, hospitalId, patientId);

      // Optional ABHA Push (Event handler or direct if feature flag is checked here, 
      // but strictly adhering to rules, a separate ABHA worker listens to patient_discharged)
      // We will let the event system handle ABDM FHIR push.

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

// --- Routes ---
const router = Router();

router.post('/admit', async (req: Request, res: Response) => {
  try {
    const result = await IPDService.admitPatient((req as any).hospital_id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to admit patient' });
  }
});

router.post('/discharge/:id', async (req: Request, res: Response) => {
  try {
    const result = await IPDService.dischargePatient((req as any).hospital_id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to discharge patient' });
  }
});

// GET /beds
router.get('/beds', async (req: Request, res: Response) => {
  res.json({ message: 'Bed dashboard data' }); // Mocked for brevity
});

export default router;
