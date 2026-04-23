import { Request, Response, Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware to ensure hospital_id is present
router.use((req: Request, res: Response, next) => {
  if (!(req as any).hospital_id) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// GET /stats/summary
router.get('/summary', async (req: Request, res: Response) => {
  const hospitalId = (req as any).hospital_id;
  const date = new Date().toISOString().split('T')[0];

  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);
    
    // Get today's stats + last 30 days totals
    const todayRes = await client.query(
      `SELECT * FROM "AnalyticsDaily" WHERE hospital_id = $1 AND date = $2`,
      [hospitalId, date]
    );

    const monthRes = await client.query(
      `SELECT 
        SUM(revenue) as total_revenue, 
        SUM(patient_count) as total_patients,
        SUM(followups_completed)::float / NULLIF(SUM(followups_scheduled), 0) * 100 as retention_rate
       FROM "AnalyticsDaily" 
       WHERE hospital_id = $1 AND date > (now() - interval '30 days')`
      , [hospitalId]
    );

    res.json({
      today: todayRes.rows[0] || { revenue: 0, patient_count: 0, prescriptions_count: 0 },
      last_30_days: monthRes.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  } finally {
    client.release();
  }
});

// GET /stats/trends
router.get('/trends', async (req: Request, res: Response) => {
  const hospitalId = (req as any).hospital_id;
  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);
    const result = await client.query(
      `SELECT date, revenue, patient_count 
       FROM "AnalyticsDaily" 
       WHERE hospital_id = $1 AND date > (now() - interval '7 days')
       ORDER BY date ASC`
      , [hospitalId]
    );
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// GET /analytics/cmo/metrics
router.get('/cmo/metrics', async (req: Request, res: Response) => {
  const hospitalId = (req as any).hospital_id;
  const client = await pool.connect();
  try {
    // Note: In real app, we would query the MATERIALIZED VIEWS
    const retentionRes = await client.query(
      `SELECT * FROM mv_retention_stats WHERE hospital_id = $1`, [hospitalId]
    );
    const benchmarkRes = await client.query(`SELECT * FROM mv_network_benchmarks`);
    
    res.json({
      hospital: retentionRes.rows[0],
      network: benchmarkRes.rows[0]
    });
  } finally {
    client.release();
  }
});

// POST /analytics/medchat/triage
router.post('/medchat/triage', async (req: Request, res: Response) => {
  const { query, patient_id } = req.body;
  const hospitalId = (req as any).hospital_id;

  const client = await pool.connect();
  try {
    // 1. Log query event
    const eventId = await client.query(
      `INSERT INTO "EventLog" (hospital_id, patient_id, event_type, metadata)
       VALUES ($1, $2, 'patient_query', $3) RETURNING id`,
      [hospitalId, patient_id, JSON.stringify({ query })]
    );

    // 2. Mock Gemini Triage logic
    const mockTriage = {
      summary: "Patient reporting chest pain and shortness of breath.",
      priority: "CRITICAL",
      department: "Cardiology",
      action: "Alerting emergency desk"
    };

    res.json({ success: true, triage: mockTriage });
  } catch (err) {
    res.status(500).json({ error: 'MedChat failure' });
  }
});

export default router;
