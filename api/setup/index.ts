import { Request, Response, Router } from 'express';
import { HospitalConfigService } from '../../services/hospital-config.service';

const router = Router();

// Middleware to ensure hospital_id is present (from tenantMiddleware)
router.use((req: Request, res: Response, next) => {
  if (!(req as any).hospital_id) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// GET /setup/config
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = await HospitalConfigService.getConfig((req as any).hospital_id);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// POST /setup/partial
router.post('/partial', async (req: Request, res: Response) => {
  const { step, config } = req.body;
  try {
    await HospitalConfigService.savePartialConfig((req as any).hospital_id, step, config);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save partial config' });
  }
});

// POST /setup/activate
router.post('/activate', async (req: Request, res: Response) => {
  try {
    await HospitalConfigService.activateHospital((req as any).hospital_id);
    res.json({ success: true, message: 'Hospital activated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to activate hospital' });
  }
});

export default router;
