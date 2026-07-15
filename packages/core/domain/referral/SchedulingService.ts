import { PrismaClient, ReferralStatus } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { ReferralEvent, ReferralEventType } from './types';

export class SchedulingService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  /**
   * Schedule a referral appointment.
   * Transitions item status to APPOINTMENT_SCHEDULED.
   */
  async scheduleAppointment(
    executionItemId: string,
    scheduledBy: string,
    scheduledAt: Date,
    locationDescription?: string,
    appointmentType?: string,
    notes?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.referralExecutionItem.findUniqueOrThrow({
        where: { id: executionItemId },
        include: { execution: true },
      });

      const appointment = await tx.referralAppointment.create({
        data: {
          executionItemId,
          scheduledAt,
          scheduledBy,
          locationDescription,
          appointmentType: appointmentType ?? 'OUTPATIENT',
          notes,
          status: 'SCHEDULED',
        },
      });

      await tx.referralExecutionItem.update({
        where: { id: executionItemId },
        data: { status: ReferralStatus.APPOINTMENT_SCHEDULED },
      });

      await tx.referralExecution.update({
        where: { id: item.executionId },
        data: { status: ReferralStatus.APPOINTMENT_SCHEDULED },
      });

      await tx.referralAudit.create({
        data: {
          executionId: item.executionId,
          action: 'APPOINTMENT_SCHEDULED',
          performedBy: scheduledBy,
          details: { appointmentId: appointment.id, scheduledAt },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_APPOINTMENT_SCHEDULED,
        executionId: item.executionId,
        itemId: executionItemId,
        hospitalId: item.execution.hospitalId,
        patientId: item.execution.patientId,
        timestamp: new Date(),
        payload: { appointmentId: appointment.id, scheduledAt },
      };

      await this.outbox.createEvent(tx, item.execution.patientId, event.eventType, event.payload);

      return appointment;
    });
  }

  /**
   * Confirm an appointment (e.g., patient confirmed attendance).
   */
  async confirmAppointment(appointmentId: string, confirmedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      return tx.referralAppointment.update({
        where: { id: appointmentId },
        data: { confirmedAt: new Date(), status: 'CONFIRMED' },
      });
    });
  }
}
