import { prisma } from '../util/prisma-singleton';

/**
 * Waitlist Service
 * Manages overflow demand and automated notification when slots open
 */
export async function addToWaitlist(data: {
  hospitalId: string;
  doctorId: string;
  patientGlobalId: string;
  priority?: number;
}) {
  return await prisma.waitlistEntry.create({
    data: {
      hospitalId: data.hospitalId,
      doctorId: data.doctorId,
      patientGlobalId: data.patientGlobalId,
      priority: data.priority || 1,
      status: 'waiting'
    }
  });
}

/**
 * Process Waitlist
 * Called when a booking is cancelled to notify the next person in line
 */
export async function notifyNextInWaitlist(doctorId: string, slotTime: Date) {
  const nextInLine = await prisma.waitlistEntry.findFirst({
    where: { 
      doctorId: doctorId,
      status: 'waiting'
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' }
    ]
  });

  if (nextInLine) {
    // Notify Patient via Outbox
    await prisma.outboxEvent.create({
      data: {
        eventType: 'WAITLIST_NOTIFICATION',
        payload: {
          waitlistId: nextInLine.id,
          patientId: nextInLine.patientGlobalId,
          doctorId,
          slotTime
        }
      }
    });

    await prisma.waitlistEntry.update({
      where: { id: nextInLine.id },
      data: { status: 'notified' }
    });
  }
}
