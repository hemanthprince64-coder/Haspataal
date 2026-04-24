import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { RetentionService } from '../../services/retention.service';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware to ensure hospital_id is present
router.use((req: Request, res: Response, next) => {
  if (!(req as any).hospital_id) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// GET /followups/today
router.get('/today', async (req: Request, res: Response) => {
  const hospitalId = (req as any).hospital_id;
  const doctorId = (req as any).user?.id || 'doc_mock_123';
  const todayStr = new Date().toISOString().split('T')[0];

  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);
    const result = await client.query(
      `SELECT id, patient_id, type, care_pathway FROM "FollowUp" 
       WHERE doctor_id = $1 AND due_date = $2 AND status = 'scheduled'`,
      [doctorId, todayStr]
    );
    res.json({ followups: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  } finally {
    client.release();
  }
});

// POST /followups/:id/complete
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const hospitalId = (req as any).hospital_id;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const result = await RetentionService.markCompleted(hospitalId, id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete follow-up' });
  }
});

export default router;
