import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { EventService } from '../../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Service ---
export class DiagnosticsService {
  public static async enterResult(hospitalId: string, orderId: string, resultData: any) {
    // In real app, save to "LabResult" table
    console.log(`[DiagnosticsService] Result entered for order ${orderId}`);

    // Emit event. Phase 8 (Notification Engine) will listen to this to send WhatsApp
    await EventService.publish('lab_result_ready', {
      order_id: orderId,
      result: resultData
    }, hospitalId);

    return { success: true };
  }
}

// --- Routes ---
const router = Router();

router.post('/order', async (req: Request, res: Response) => {
  // Mock test order
  res.json({ success: true, order_id: 'ORD-123' });
});

router.post('/result', async (req: Request, res: Response) => {
  try {
    const { orderId, resultData } = req.body;
    const result = await DiagnosticsService.enterResult((req as any).hospital_id, orderId, resultData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

export default router;
