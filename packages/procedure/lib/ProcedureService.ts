import {
  PrismaClient,
  ProcedureExecutionStatus,
  ProcedureChecklistStatus,
  ProcedureOutcome,
} from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import {
  ArrivePatientInput,
  StartProcedureInput,
  CompleteProcedureInput,
  ProcedureEventName,
} from './types';

export class ProcedureService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async arrivePatient(input: ArrivePatientInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Row lock on execution
      await tx.$executeRaw`SELECT id FROM procedure_execution WHERE id = ${input.executionId} FOR UPDATE`;

      const execution = await tx.procedureExecution.findUnique({
        where: { id: input.executionId },
        include: { appointment: true },
      });

      if (!execution) throw new Error('Execution not found');
      if (execution.status === ProcedureExecutionStatus.PRE_OP)
        throw new Error('Patient already arrived');
      if (
        [
          ProcedureExecutionStatus.IN_PROGRESS,
          ProcedureExecutionStatus.RECOVERY,
          ProcedureExecutionStatus.COMPLETED,
          ProcedureExecutionStatus.CANCELLED,
        ].includes(execution.status)
      ) {
        throw new Error(`Patient cannot arrive in status ${execution.status}`);
      }

      // Ensure room is available if scheduled
      if (!execution.appointment) {
        throw new Error('Procedure must be scheduled before arrival');
      }

      // Update execution status
      await tx.procedureExecution.update({
        where: { id: execution.id },
        data: { status: ProcedureExecutionStatus.PRE_OP },
      });

      await tx.procedureExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: ProcedureExecutionStatus.PRE_OP },
      });

      // Create Session
      const session = await tx.procedureSession.create({
        data: {
          executionId: execution.id,
          roomId: execution.appointment.roomId,
          patientEnteredAt: new Date(),
        },
      });

      await this.outbox.createEvent(
        tx,
        execution.patientId,
        ProcedureEventName.PATIENT_ENTERED_PROCEDURE_ROOM,
        {
          executionId: execution.id,
          sessionId: session.id,
          roomId: execution.appointment.roomId,
        },
      );
    });
  }

  async startProcedure(input: StartProcedureInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Row lock on session
      await tx.$executeRaw`SELECT id FROM procedure_session WHERE id = ${input.sessionId} FOR UPDATE`;

      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { execution: true, checklist: true },
      });

      if (!session) throw new Error('Session not found');

      if (session.procedureStartedAt) {
        throw new Error('Procedure already started');
      }

      // WHO Checklist enforcement
      if (
        !session.checklist ||
        session.checklist.status !== ProcedureChecklistStatus.TIME_OUT_COMPLETE
      ) {
        throw new Error('Procedure cannot start: TIME_OUT checklist is not complete');
      }

      const now = new Date();

      await tx.procedureSession.update({
        where: { id: session.id },
        data: { procedureStartedAt: now },
      });

      await tx.procedureExecution.update({
        where: { id: session.executionId },
        data: { status: ProcedureExecutionStatus.IN_PROGRESS },
      });

      await tx.procedureExecutionItem.updateMany({
        where: { executionId: session.executionId },
        data: { status: ProcedureExecutionStatus.IN_PROGRESS },
      });

      // Mark Room as IN_USE
      await tx.procedureRoom.update({
        where: { id: session.roomId },
        data: { status: 'IN_USE' },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.PROCEDURE_STARTED,
        {
          sessionId: session.id,
          executionId: session.executionId,
          startedAt: now.toISOString(),
        },
      );
    });
  }

  async completeProcedure(input: CompleteProcedureInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM procedure_session WHERE id = ${input.sessionId} FOR UPDATE`;

      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { execution: true, checklist: true },
      });

      if (!session) throw new Error('Session not found');

      if (!session.procedureStartedAt) throw new Error('Procedure not started yet');
      if (session.procedureEndedAt) throw new Error('Procedure already completed');

      // Check SIGN_OUT is complete before finishing
      if (
        !session.checklist ||
        session.checklist.status !== ProcedureChecklistStatus.SIGN_OUT_COMPLETE
      ) {
        throw new Error('Procedure cannot complete: SIGN_OUT checklist is not complete');
      }

      const now = new Date();

      await tx.procedureSession.update({
        where: { id: session.id },
        data: {
          procedureEndedAt: now,
          patientExitedAt: now,
          outcome: input.outcome as ProcedureOutcome,
        },
      });

      await tx.procedureExecution.update({
        where: { id: session.executionId },
        data: { status: ProcedureExecutionStatus.COMPLETED },
      });

      await tx.procedureExecutionItem.updateMany({
        where: { executionId: session.executionId },
        data: { status: ProcedureExecutionStatus.COMPLETED },
      });

      // Release Room
      await tx.procedureRoom.update({
        where: { id: session.roomId },
        data: { status: 'AVAILABLE' },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.PROCEDURE_COMPLETED,
        {
          sessionId: session.id,
          executionId: session.executionId,
          outcome: input.outcome,
          completedAt: now.toISOString(),
        },
      );
    });
  }
}
