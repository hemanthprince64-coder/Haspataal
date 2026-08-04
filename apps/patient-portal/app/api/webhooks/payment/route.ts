import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const razorpayWebhookSchema = z.object({
  entity: z.string(),
  account_id: z.string(),
  event: z.string(),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number(),
          currency: z.string(),
          status: z.string(),
          method: z.string(),
          captured: z.boolean(),
          order_id: z.string(),
          created_at: z.number(),
        }),
      })
      .optional(),
    order: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number(),
          currency: z.string(),
          status: z.string(),
        }),
      })
      .optional(),
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = razorpayWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 422 });
  }

  const paymentEntity = parsed.data.payload?.payment?.entity;
  const orderEntity = parsed.data.payload?.order?.entity;

  if (!paymentEntity && !orderEntity) {
    return NextResponse.json({ error: 'Missing payment/order entity' }, { status: 422 });
  }

  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;
  const amount = paymentEntity?.amount || orderEntity?.amount || 0;
  const status = paymentEntity?.status || orderEntity?.status || 'PENDING';

  if (!razorpayOrderId) {
    return NextResponse.json({ error: 'Missing order reference' }, { status: 422 });
  }

  const payment = await prisma.appointmentPayment.findFirst({
    where: { orderId: razorpayOrderId },
    include: { appointment: true },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  if (status === 'captured') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          paymentId: razorpayPaymentId || payment.paymentId,
          amount: Math.round(amount / 100),
        },
      });

      if (payment.appointment) {
        await tx.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'CONFIRMED' },
        });
      }
    });

    logger.info({ appointmentId: payment.appointmentId }, '[PaymentWebhook] Payment confirmed');
    return NextResponse.json({ received: true });
  }

  if (status === 'failed' || status === 'cancelled') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      if (payment.appointment) {
        await tx.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'CANCELLED' },
        });
      }
    });

    logger.info(
      { appointmentId: payment.appointmentId },
      '[PaymentWebhook] Payment failed, slot released',
    );
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, status });
}
