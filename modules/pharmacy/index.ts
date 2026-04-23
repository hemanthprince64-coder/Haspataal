import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { EventService } from '../../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Service ---
export class PharmacyService {
  // Consumer: Listens to 'doctor_prescribes'
  public static async handlePrescriptionEvent(event: any) {
    const { hospital_id, metadata } = event;
    // Auto-deduct stock logic
    console.log('[PharmacyService] Auto-deducting stock for prescription:', metadata.prescription_id);
    
    // Emit 'medicine_dispensed' so Billing picks it up
    await EventService.publish('medicine_dispensed', {
      prescription_id: metadata.prescription_id,
      items: metadata.items
    }, hospital_id);
  }
}

// --- Routes ---
const router = Router();

router.post('/inventory', async (req: Request, res: Response) => {
  // Mock adding stock
  res.json({ success: true, message: 'Stock added' });
});

router.get('/alerts', async (req: Request, res: Response) => {
  // Mock low stock alerts
  res.json({
    alerts: [
      { medicine: 'Paracetamol 500mg', current_stock: 50, threshold: 100 }
    ]
  });
});

export default router;
