import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { EventService } from '../../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Types ---
export interface OPDVisitPayload {
  patient_id: string;
  doctor_id: string;
  chief_complaint: string;
  vitals: { temp?: string, bp?: string, pulse?: string };
}

// --- Service ---
export class OPDService {
  public static async registerVisit(hospitalId: string, payload: OPDVisitPayload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      // 1. Insert Visit
      const res = await client.query(
        `INSERT INTO "Visit" (hospital_id, patient_id, doctor_id, type, chief_complaint, vitals, status) 
         VALUES ($1, $2, $3, 'OPD', $4, $5, 'waiting') RETURNING id`,
        [hospitalId, payload.patient_id, payload.doctor_id, payload.chief_complaint, JSON.stringify(payload.vitals)]
      );
      
      const visitId = res.rows[0].id;

      // 2. Emit Event (Billing will listen to this)
      await EventService.publish('patient_visited', { visit_id: visitId, ...payload }, hospitalId, payload.patient_id);

      await client.query('COMMIT');
      return { visit_id: visitId, status: 'waiting' };
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

router.post('/visit', async (req: Request, res: Response) => {
  try {
    const hospitalId = (req as any).hospital_id;
    const result = await OPDService.registerVisit(hospitalId, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register visit' });
  }
});

// GET /queue (Mock token system)
router.get('/queue', async (req: Request, res: Response) => {
  const hospitalId = (req as any).hospital_id;
  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);
    const result = await client.query(`SELECT id, patient_id, status FROM "Visit" WHERE type='OPD' AND status='waiting'`);
    res.json(result.rows);
  } finally {
    client.release();
  }
});

export default router;
