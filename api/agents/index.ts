import { Request, Response, Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /agents/referrals
router.get('/referrals', async (req: Request, res: Response) => {
  const agentId = (req as any).user?.id || 'agent_mock_123';
  
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT h.id, h.name, h.verified_at, h.onboarding_pct 
       FROM "Hospital" h
       JOIN "AgentReferral" r ON h.id = r.hospital_id
       WHERE r.agent_id = $1`,
      [agentId]
    );
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// GET /agents/commissions
router.get('/commissions', async (req: Request, res: Response) => {
  const agentId = (req as any).user?.id || 'agent_mock_123';
  
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        SUM(amount) as total_earned,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_payouts
       FROM "AgentCommission"
       WHERE agent_id = $1`,
      [agentId]
    );
    res.json(result.rows[0]);
  } finally {
    client.release();
  }
});

export default router;
