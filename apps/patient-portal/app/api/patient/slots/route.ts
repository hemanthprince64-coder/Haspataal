import { NextRequest, NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

export async function GET(req: NextRequest) {
  await requireRole(UserRole.PATIENT, 'session_patient');

  const doctorId = req.nextUrl.searchParams.get('doctorId');
  const date = req.nextUrl.searchParams.get('date');

  if (!doctorId || !date) {
    return NextResponse.json({ error: 'doctorId and date are required' }, { status: 422 });
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const now = new Date();
  const isToday =
    targetDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const existingBookings = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: targetDate,
      status: { in: ['BOOKED', 'CONFIRMED', 'AWAITING_PAYMENT'] },
    },
    select: { slot: true },
  });

  const bookedSlots = new Set(existingBookings.map((b) => b.slot));

  const allSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ];

  const slots = allSlots.map((time) => {
    let available = !bookedSlots.has(time);
    if (isToday) {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hours, minutes, 0, 0);
      if (slotDateTime.getTime() <= now.getTime()) {
        available = false;
      }
    }
    return { time, available };
  });

  return NextResponse.json({ slots });
}
