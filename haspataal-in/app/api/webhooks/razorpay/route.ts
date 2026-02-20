
import { NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';

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
        // In real app, metadata should contain hospital_id and plan_id
        // For MVP, assuming we can extract it or logic is handled elsewhere.
        // We record the transaction here securely if needed.
        console.log('Payment Captured:', payment.id);
    }

    return NextResponse.json({ status: 'ok' });
}
