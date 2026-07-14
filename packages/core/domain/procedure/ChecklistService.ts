import { PrismaClient, ProcedureChecklistStatus } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import {
  SignInChecklistInput,
  TimeOutChecklistInput,
  SignOutChecklistInput,
  ProcedureEventName,
} from './types';

export class ChecklistService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async signIn(input: SignInChecklistInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { checklist: true, execution: true },
      });

      if (!session) throw new Error('Session not found');

      if (!session.checklist) {
        // Create checklist if it doesn't exist
        await tx.procedureChecklist.create({
          data: {
            sessionId: session.id,
            status: ProcedureChecklistStatus.SIGN_IN_COMPLETE,
            signInAt: new Date(),
            signInBy: actorId,
          },
        });
      } else {
        if (session.checklist.status !== ProcedureChecklistStatus.PENDING) {
          throw new Error(
            `Checklist already past SIGN_IN state (current: ${session.checklist.status})`,
          );
        }
        await tx.procedureChecklist.update({
          where: { id: session.checklist.id },
          data: {
            status: ProcedureChecklistStatus.SIGN_IN_COMPLETE,
            signInAt: new Date(),
            signInBy: actorId,
          },
        });
      }

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.WHO_CHECKLIST_COMPLETED,
        {
          sessionId: session.id,
          stage: 'SIGN_IN',
          completedBy: actorId,
        },
      );
    });
  }

  async timeOut(input: TimeOutChecklistInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { checklist: true, execution: true },
      });

      if (!session || !session.checklist) throw new Error('Session or Checklist not found');

      if (session.checklist.status !== ProcedureChecklistStatus.SIGN_IN_COMPLETE) {
        throw new Error(`Cannot perform TIME_OUT from state ${session.checklist.status}`);
      }

      await tx.procedureChecklist.update({
        where: { id: session.checklist.id },
        data: {
          status: ProcedureChecklistStatus.TIME_OUT_COMPLETE,
          timeOutAt: new Date(),
          timeOutBy: actorId,
        },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.WHO_CHECKLIST_COMPLETED,
        {
          sessionId: session.id,
          stage: 'TIME_OUT',
          completedBy: actorId,
        },
      );
    });
  }

  async signOut(input: SignOutChecklistInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { checklist: true, execution: true },
      });

      if (!session || !session.checklist) throw new Error('Session or Checklist not found');

      if (session.checklist.status !== ProcedureChecklistStatus.TIME_OUT_COMPLETE) {
        throw new Error(`Cannot perform SIGN_OUT from state ${session.checklist.status}`);
      }

      await tx.procedureChecklist.update({
        where: { id: session.checklist.id },
        data: {
          status: ProcedureChecklistStatus.SIGN_OUT_COMPLETE,
          signOutAt: new Date(),
          signOutBy: actorId,
        },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.WHO_CHECKLIST_COMPLETED,
        {
          sessionId: session.id,
          stage: 'SIGN_OUT',
          completedBy: actorId,
        },
      );
    });
  }
}
