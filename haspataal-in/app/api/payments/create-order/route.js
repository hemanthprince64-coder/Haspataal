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
        const { amount, doctorId, patientName, patientMobile, date, slot } = await req.json();

        // 1. Upsert Patient (if guest booking) or use Session Patient?
        // For simpler flow, we trust the form input for now or upsert based on mobile.
        let patientId = session?.user?.id;

        if (!patientId && patientMobile) {
            // Guest Flow: Create/Find patient by mobile
            const patient = await prisma.patient.upsert({
                where: { phone: patientMobile },
                update: { name: patientName },
                create: {
                    name: patientName,
                    phone: patientMobile,
                    password: 'password123' // Temp password
                }
            });
            patientId = patient.id;
        }

        // 2. Create PENDING Appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                date: new Date(date),
                slot,
                status: 'PENDING',
                notes: 'Online Booking - Payment Pending'
            }
        });

        // 3. Create Razorpay Order
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${appointment.id}`,
        };

        const order = await razorpay.orders.create(options);

        // 4. Create Payment Record linked to Appointment
        await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: amount * 100,
                currency: 'INR',
                status: 'PENDING',
                appointmentId: appointment.id
            }
        });

        return NextResponse.json({ ...order, appointmentId: appointment.id });

    } catch (error) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
    }
}
