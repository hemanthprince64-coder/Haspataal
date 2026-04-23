import { Request, Response, Router } from 'express';
import { EventService } from '../../services/event.service';
import { DocumentService } from '../../services/document.service';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /hospitals/register
router.post('/register', async (req: Request, res: Response) => {
  const { hospitalName, city, type, repName, repPhone, email, password } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create Hospital Record (status: pending)
    const hospitalRes = await client.query(
      `INSERT INTO "Hospital" (name, type, city, state, onboarding_pct) VALUES ($1, $2, $3, $4, 25) RETURNING id`,
      [hospitalName, type, city, 'UP'] // Defaulting state to UP for Lucknow-first
    );
    const hospitalId = hospitalRes.rows[0].id;

    // 2. Create User Record (Admin)
    await client.query(
      `INSERT INTO "User" (hospital_id, role, phone, email) VALUES ($1, 'admin', $2, $3)`,
      [hospitalId, repPhone, email]
    );

    // 3. Emit hospital_registered event
    await EventService.publish('hospital_registered', {
      hospitalName, city, repName, email
    }, hospitalId);

    await client.query('COMMIT');
    res.status(201).json({ hospital_id: hospitalId, status: 'pending' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// GET /hospitals/:id/onboarding-status
router.get('/:id/onboarding-status', async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT verified_at FROM "Hospital" WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });

    const verifiedAt = result.rows[0].verified_at;
    
    // Simulate checking document rejections
    const docResult = await client.query(
      `SELECT count(*) FROM "HospitalDocuments" WHERE hospital_id = $1 AND status = 'rejected'`, 
      [id]
    );
    const rejectedDocs = parseInt(docResult.rows[0].count, 10);

    if (verifiedAt) {
      res.json({ status: 'verified', verified_at: verifiedAt });
    } else if (rejectedDocs > 0) {
      res.json({ status: 'rejected', message: 'Documents require re-upload' });
    } else {
      res.json({ status: 'pending' });
    }
  } finally {
    client.release();
  }
});

// POST /hospitals/:id/documents would use multer for multipart parsing
// router.post('/:id/documents', upload.single('file'), async (req, res) => { ... })

export default router;
