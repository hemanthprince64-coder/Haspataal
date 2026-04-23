import { Request, Response, Router } from 'express';
import { PrescriptionService } from '../../services/prescription.service';

const router = Router();

// Middleware to ensure hospital_id is present (from tenantMiddleware)
router.use((req: Request, res: Response, next) => {
  if (!(req as any).hospital_id) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// POST /prescriptions/create
router.post('/create', async (req: Request, res: Response) => {
  try {
    const hospitalId = (req as any).hospital_id;
    // Mocking doctor extraction from JWT
    const doctorId = (req as any).user?.id || 'doc_mock_123';
    
    const result = await PrescriptionService.createPrescription(hospitalId, doctorId, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// GET /prescriptions/templates
router.get('/templates', async (req: Request, res: Response) => {
  // Mock fetch templates
  res.json({
    templates: [
      { id: 1, name: 'Standard URTI', diagnosis: 'URTI', medicines: [] }
    ]
  });
});

export default router;
