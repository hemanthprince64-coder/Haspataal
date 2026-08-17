import { NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { logger } from '@haspataal/logger';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';

  if (!signature || !BillingService.verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(body);

  if (payload.event === 'payment.captured') {
    const payment = payload.payload.payment.entity;
    // TODO: Extract hospital_id + plan_id from payment metadata and record transaction
    logger.info({ action: 'razorpay_payment_captured', paymentId: payment.id });
  }

  return NextResponse.json({ status: 'ok' });
}
