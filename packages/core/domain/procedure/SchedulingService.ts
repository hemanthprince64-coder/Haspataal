import { PrismaClient, ProcedureExecutionStatus, AppointmentStatus } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { ScheduleProcedureInput, ProcedureEventName } from './types';

export class SchedulingService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async scheduleProcedure(input: ScheduleProcedureInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Validate Room
      const room = await tx.procedureRoom.findUnique({
        where: { id: input.roomId },
      });
      if (!room) throw new Error('Procedure room not found');
      if (room.status !== 'AVAILABLE') throw new Error(`Procedure room is ${room.status}`);

      // 2. Concurrency Control: Raw SQL Lock on Room
      await tx.$executeRaw`SELECT id FROM procedure_room WHERE id = ${input.roomId} FOR UPDATE`;

      // 3. Conflict Detection
      const conflicts = await tx.procedureAppointment.findMany({
        where: {
          roomId: input.roomId,
          status: AppointmentStatus.BOOKED,
          AND: [
            { scheduledStartTime: { lt: input.endTime } },
            { scheduledEndTime: { gt: input.startTime } },
          ],
        },
      });

      if (conflicts.length > 0) {
        throw new Error('Appointment time conflict with existing booking');
      }

      const execution = await tx.procedureExecution.findUnique({
        where: { id: input.executionId },
      });
      if (!execution) throw new Error('Execution not found');

      // 4. Create appointment
      const appointment = await tx.procedureAppointment.create({
        data: {
          executionId: execution.id,
          roomId: input.roomId,
          scheduledStartTime: input.startTime,
          scheduledEndTime: input.endTime,
          status: AppointmentStatus.BOOKED,
        },
      });

      // 5. Link execution to appointment & update status
      await tx.procedureExecution.update({
        where: { id: execution.id },
        data: {
          status: ProcedureExecutionStatus.SCHEDULED,
        },
      });

      await tx.procedureExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: ProcedureExecutionStatus.SCHEDULED },
      });

      // 6. Outbox Event
      await this.outbox.createEvent(
        tx,
        execution.patientId,
        ProcedureEventName.PROCEDURE_SCHEDULED,
        {
          executionId: execution.id,
          appointmentId: appointment.id,
          roomId: input.roomId,
          startTime: input.startTime.toISOString(),
          endTime: input.endTime.toISOString(),
        },
      );
    });
  }
}
