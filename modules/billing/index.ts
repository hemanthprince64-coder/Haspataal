import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { EventService } from '../../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Types ---
export interface LineItem {
  description: string;
  amount: number;
  type: 'consultation' | 'procedure' | 'medicine' | 'diagnostic';
}

// --- Service ---
export class BillingService {
  // Utility for GST
  public static calculateGST(amount: number, type: string): number {
    let rate = 0;
    if (type === 'medicine') rate = 0.12; // 12%
    else if (type === 'diagnostic') rate = 0.18; // 18%
    else rate = 0.05; // 5% base
    return amount * rate;
  }

  // Consumer: Listens to patient_visited, medicine_dispensed, etc.
  public static async handleEvent(event: any) {
    // In a real app, this runs in a worker listening to Redis Streams
    // e.g. if event.type === 'patient_visited', we insert a consultation line item into an open invoice.
    console.log('[BillingService] Processing event to auto-populate invoice:', event.event_type);
  }

  public static async recordPayment(hospitalId: string, invoiceId: string, method: string, amount: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      // 1. Update Invoice status
      await client.query(
        `UPDATE "Invoice" SET status='paid', payment_method=$1 WHERE id=$2 AND hospital_id=$3`,
        [method, invoiceId, hospitalId]
      );

      // 2. Emit Event
      await EventService.publish('bill_paid', { invoice_id: invoiceId, method, amount }, hospitalId);

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

// --- Routes ---
const router = Router();

router.get('/invoice/:visitId', async (req: Request, res: Response) => {
  // Mock fetching auto-populated invoice
  res.json({
    visit_id: req.params.visitId,
    line_items: [
      { description: 'OPD Consultation', amount: 500, gst: 25, total: 525 }
    ],
    grand_total: 525
  });
});

router.post('/invoice/pay', async (req: Request, res: Response) => {
  try {
    const { invoiceId, method, amount } = req.body;
    const result = await BillingService.recordPayment((req as any).hospital_id, invoiceId, method, amount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

export default router;
