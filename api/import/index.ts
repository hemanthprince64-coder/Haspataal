import { Request, Response, Router } from 'express';
import { MigrationService } from '../../services/migration.service';

const router = Router();

// Middleware to ensure hospital_id is present (from tenantMiddleware)
router.use((req: Request, res: Response, next) => {
  if (!(req as any).hospital_id) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// POST /import/patients/batch
router.post('/patients/batch', async (req: Request, res: Response) => {
  const { mappedRows } = req.body;
  const hospitalId = (req as any).hospital_id;

  if (!Array.isArray(mappedRows) || mappedRows.length > 500) {
    return res.status(400).json({ error: 'Payload must be an array of max 500 rows' });
  }

  try {
    const result = await MigrationService.importPatientsBatch(hospitalId, mappedRows);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Batch import failed' });
  }
});

// POST /import/complete
router.post('/complete', async (req: Request, res: Response) => {
  const { totalRows, sourceType } = req.body;
  const hospitalId = (req as any).hospital_id;

  try {
    await MigrationService.finalizeMigration(hospitalId, totalRows, sourceType);
    res.json({ success: true, message: 'Migration completed and event emitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to finalize migration' });
  }
});

export default router;
