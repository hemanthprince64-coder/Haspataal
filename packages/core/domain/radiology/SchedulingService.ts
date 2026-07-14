import { PrismaClient } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { ScheduleRadiologyInput, ArrivePatientInput, RadiologyEventName } from './types';

export class SchedulingService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async scheduleAppointment(input: ScheduleRadiologyInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Validate Modality and time
      const modality = await tx.modalityDevice.findUnique({
        where: { id: input.modalityId },
      });
      if (!modality) throw new Error('Modality not found');
      if (modality.status !== 'ACTIVE') throw new Error(`Modality is ${modality.status}`);

      // 2. Concurrency Control: Raw SQL Lock on Modality
      // Lock the modality device to prevent concurrent booking windows from racing
      await tx.$executeRaw`SELECT id FROM modality_devices WHERE id = ${input.modalityId} FOR UPDATE`;

      // 3. Conflict Detection
      const conflicts = await tx.radiologyAppointment.findMany({
        where: {
          modalityId: input.modalityId,
          status: 'SCHEDULED',
          AND: [{ startTime: { lt: input.endTime } }, { endTime: { gt: input.startTime } }],
        },
      });

      if (conflicts.length > 0) {
        throw new Error('Appointment time conflict with existing booking');
      }

      const execution = await tx.radiologyExecution.findUnique({
        where: { id: input.executionId },
      });
      if (!execution) throw new Error('Execution not found');

      // 4. Create appointment
      const appointment = await tx.radiologyAppointment.create({
        data: {
          hospitalId: execution.hospitalId,
          patientId: execution.patientId,
          startTime: input.startTime,
          endTime: input.endTime,
          modalityId: input.modalityId,
          status: 'SCHEDULED',
        },
      });

      // 5. Link execution to appointment
      await tx.radiologyExecution.update({
        where: { id: execution.id },
        data: {
          appointmentId: appointment.id,
          status: 'SCHEDULED',
        },
      });

      await tx.radiologyExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: 'SCHEDULED' },
      });

      // 6. Outbox Event
      await this.outbox.createEvent(
        tx,
        execution.patientId,
        RadiologyEventName.RADIOLOGY_APPOINTMENT_SCHEDULED,
        {
          executionId: execution.id,
          appointmentId: appointment.id,
          modalityId: input.modalityId,
          startTime: input.startTime.toISOString(),
          endTime: input.endTime.toISOString(),
        },
      );
    });
  }

  async arrivePatient(input: ArrivePatientInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Row lock on execution
      await tx.$executeRaw`SELECT id FROM radiology_executions WHERE id = ${input.executionId} FOR UPDATE`;

      const execution = await tx.radiologyExecution.findUnique({
        where: { id: input.executionId },
      });

      if (!execution) throw new Error('Execution not found');
      if (execution.status === 'ARRIVED') throw new Error('Patient already arrived');
      if (
        ['ACQUIRING', 'ACQUIRED', 'REPORTING', 'REPORT_VERIFIED', 'RELEASED'].includes(
          execution.status,
        )
      ) {
        throw new Error(`Patient cannot arrive in status ${execution.status}`);
      }

      await tx.radiologyExecution.update({
        where: { id: execution.id },
        data: { status: 'ARRIVED' },
      });

      await tx.radiologyExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: 'ARRIVED' },
      });

      if (execution.appointmentId) {
        await tx.radiologyAppointment.update({
          where: { id: execution.appointmentId },
          data: { status: 'ARRIVED' },
        });
      }

      await this.outbox.createEvent(
        tx,
        execution.patientId,
        RadiologyEventName.PATIENT_ARRIVED_RADIOLOGY,
        {
          executionId: execution.id,
          appointmentId: execution.appointmentId,
        },
      );
    });
  }
}
