import Razorpay from 'razorpay';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'test_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_key_secret',
});

export async function POST(req) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { amount, appointmentId } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        }

        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${appointmentId ? appointmentId.slice(0, 10) : Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Store Pending Payment in DB
        // NOTE: This requires 'orderId' column in Payment table (Schema update Day 15)
        await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: amount * 100,
                currency: 'INR',
                status: 'PENDING',
                // We don't have appointmentId yet, or we could create a PENDING appointment here?
                // For simplicity, we just track payment. Linking happens in verify.
            }
        });

        return NextResponse.json(order);

    } catch (error) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
    }
}
