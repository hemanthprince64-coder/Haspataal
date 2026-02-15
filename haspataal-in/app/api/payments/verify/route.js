import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSMS } from '@/lib/notifications';

export async function POST(req) {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpaySignature,
            doctorId,
            patientName,
            patientMobile,
            date,
            amount
        } = await req.json();

        // 1. Validate signature
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_key_secret');
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpaySignature) {
            return NextResponse.json({ message: 'Transaction not legit!' }, { status: 400 });
        }

        // 3. Confirm Appointment & Update Payment
        const result = await prisma.$transaction(async (tx) => {
            // Update Appointment Status
            const appointment = await tx.appointment.update({
                where: { id: appointmentId }, // Passed from client
                data: {
                    status: "CONFIRMED",
                    // Slot and Date are already set during creation
                }
            });

            // Update Payment Status
            // Find payment by orderId (created in create-order)
            const payment = await tx.payment.updateMany({
                where: { orderId: orderCreationId },
                data: {
                    paymentId: razorpayPaymentId,
                    status: "SUCCESS"
                }
            });

            return { appointment };
        });

        // 4. Send Notification
        await sendSMS(patientMobile, `Booking Confirmed! Your appointment is on ${new Date(date).toLocaleDateString()} at ${result.appointment.slot}.`);

        return NextResponse.json({
            message: 'success',
            appointmentId: result.appointment.id
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ message: 'Verification failed' }, { status: 500 });
    }
}
