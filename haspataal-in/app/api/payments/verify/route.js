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

        // 2. Find or Create Patient
        let patient = await prisma.patient.findUnique({
            where: { phone: patientMobile }
        });

        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    name: patientName,
                    phone: patientMobile,
                    password: patientMobile, // Default password = mobile for guest checkout
                    city: 'Unknown'
                }
            });
        }

        // 3. Create Appointment & Payment in Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create Appointment
            const appointment = await tx.appointment.create({
                data: {
                    patientId: patient.id,
                    doctorId: doctorId,
                    date: new Date(date),
                    slot: "09:00 AM", // Default slot for Month 1 MVP
                    status: "CONFIRMED",
                    notes: "Online Booking"
                }
            });

            // Create Payment
            const payment = await tx.payment.create({
                data: {
                    appointmentId: appointment.id,
                    orderId: orderCreationId,
                    paymentId: razorpayPaymentId,
                    amount: amount,
                    status: "SUCCESS",
                    currency: "INR"
                }
            });

            return { appointment, payment };
        });

        // 4. Send Notification
        await sendSMS(patientMobile, `Booking Confirmed! Dr. appointment on ${date}. Order: ${orderCreationId}`);

        return NextResponse.json({
            message: 'success',
            appointmentId: result.appointment.id,
            paymentId: result.payment.id
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ message: 'Verification failed' }, { status: 500 });
    }
}
