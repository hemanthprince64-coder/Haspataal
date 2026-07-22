/* eslint-disable */
import Razorpay from 'razorpay';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isLocalMode = process.env.DATABASE_PROVIDER === 'sqlite' || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'test_key_id';

const razorpay = !isLocalMode ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, doctorId, patientName, patientMobile, date, slot } = await req.json();

    // 1. Upsert Patient (if guest booking) or use Session Patient
    let patientId = session?.user?.id;

    if (!patientId && patientMobile) {
      // Guest Flow: Create/Find patient by mobile
      const patient = await prisma.patient.upsert({
        where: { phone: patientMobile },
        update: { name: patientName },
        create: {
          name: patientName,
          phone: patientMobile,
          password: 'password123', // Temp password
        },
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
        notes: isLocalMode ? 'Local Booking - Awaiting Cash/UPI Verification' : 'Online Booking - Payment Pending',
      },
    });

    if (isLocalMode) {
      const orderId = `local_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Create local Payment Record linked to Appointment
      await prisma.payment.create({
        data: {
          orderId: orderId,
          amount: amount * 100,
          currency: 'INR',
          status: 'PENDING',
          appointmentId: appointment.id,
        },
      });

      // Generate standard UPI Payment URL for QR code generation
      const clinicUpi = process.env.CLINIC_UPI_ID || 'clinic@upi';
      const clinicName = encodeURIComponent(process.env.CLINIC_NAME || 'Haspataal Clinic');
      const note = encodeURIComponent(`Appt_${appointment.id.substring(0, 8)}`);
      const upiUri = `upi://pay?pa=${clinicUpi}&pn=${clinicName}&am=${amount}&cu=INR&tn=${note}`;

      return NextResponse.json({
        id: orderId,
        amount: amount * 100,
        currency: 'INR',
        receipt: `receipt_${appointment.id}`,
        status: 'created',
        appointmentId: appointment.id,
        isLocalMode: true,
        upiUri,
      });
    }

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
        appointmentId: appointment.id,
      },
    });

    return NextResponse.json({ ...order, appointmentId: appointment.id });
  } catch (error) {
    // console.error('Payment Order Error:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}

