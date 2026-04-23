import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

// Assuming global instance or injected dependency
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Tenant Middleware for strict hospital_id isolation.
 * Extracts the tenant ID, binds a Postgres client to the request,
 * starts a transaction, and sets the local RLS variable.
 */
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Extract hospital_id from headers (e.g., API requests) or user context (e.g., JWT)
  const hospitalId = req.headers['x-hospital-id'] || (req as any).user?.hospital_id;

  if (!hospitalId) {
    return res.status(401).json({ 
      error: 'Tenant isolation failed: missing hospital_id context' 
    });
  }

  // Attach raw ID to request for easy access in handlers
  (req as any).hospital_id = hospitalId;

  // Allocate a dedicated client from the pool for this request's lifecycle
  const client = await pool.connect();

  try {
    // Start a transaction. SET LOCAL requires a transaction block.
    await client.query('BEGIN');

    // Apply Row Level Security (RLS) setting for this transaction only.
    // This prevents tenant context leakage back into the connection pool.
    await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

    // Attach the isolated client to the request object.
    // Route handlers MUST use req.dbClient for all queries to respect RLS.
    (req as any).dbClient = client;

    // Automatically manage transaction commit/rollback on response completion
    res.on('finish', async () => {
      try {
        if (res.statusCode >= 400) {
          await client.query('ROLLBACK');
        } else {
          await client.query('COMMIT');
        }
      } catch (err) {
        console.error('[TenantMiddleware] Error during transaction closure:', err);
      } finally {
        client.release();
      }
    });

    next();
  } catch (error) {
    // If setup fails, rollback immediately
    await client.query('ROLLBACK');
    client.release();
    next(error);
  }
};
