import { PrismaClient } from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import { StartAnesthesiaInput, EndAnesthesiaInput, ProcedureEventName } from './types';

export class AnesthesiaService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async startAnesthesia(input: StartAnesthesiaInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { anesthesia: true, execution: true },
      });

      if (!session) throw new Error('Session not found');
      if (session.anesthesia) {
        throw new Error('Anesthesia already started for this session');
      }

      await tx.anesthesiaEpisode.create({
        data: {
          sessionId: session.id,
          anesthesiaType: input.anesthesiaType,
          anesthetistId: actorId,
          inductionAt: new Date(),
        },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.ANESTHESIA_STARTED,
        {
          sessionId: session.id,
          anesthesiaType: input.anesthesiaType,
          anesthetistId: actorId,
        },
      );
    });
  }

  async endAnesthesia(input: EndAnesthesiaInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { anesthesia: true, execution: true },
      });

      if (!session || !session.anesthesia) throw new Error('Session or Anesthesia not found');

      if (session.anesthesia.emergenceAt) {
        throw new Error('Anesthesia already ended');
      }

      await tx.anesthesiaEpisode.update({
        where: { id: session.anesthesia.id },
        data: { emergenceAt: new Date() },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.ANESTHESIA_ENDED,
        {
          sessionId: session.id,
          anesthetistId: actorId,
        },
      );
    });
  }
}
