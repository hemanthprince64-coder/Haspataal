import { PrismaClient } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import {
  RecordCriticalIncidentInput,
  AcknowledgeCriticalIncidentInput,
  ProcedureEventName,
} from './types';

export class CriticalIncidentService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async recordIncident(input: RecordCriticalIncidentInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.procedureSession.findUnique({
        where: { id: input.sessionId },
        include: { execution: true },
      });

      if (!session) throw new Error('Session not found');

      const incident = await tx.procedureCriticalIncident.create({
        data: {
          sessionId: input.sessionId,
          description: input.description,
          detectedAt: new Date(),
          detectedBy: actorId,
        },
      });

      await this.outbox.createEvent(
        tx,
        session.execution.patientId,
        ProcedureEventName.CRITICAL_INCIDENT_RECORDED,
        {
          sessionId: session.id,
          incidentId: incident.id,
          detectedBy: actorId,
        },
      );
    });
  }

  async acknowledgeIncident(
    input: AcknowledgeCriticalIncidentInput,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const incident = await tx.procedureCriticalIncident.findUnique({
        where: { id: input.incidentId },
        include: { session: { include: { execution: true } } },
      });

      if (!incident) throw new Error('Critical incident not found');
      if (incident.acknowledgedAt) throw new Error('Incident already acknowledged');

      await tx.procedureCriticalIncident.update({
        where: { id: incident.id },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedBy: actorId,
          resolution: input.resolution,
        },
      });

      await this.outbox.createEvent(
        tx,
        incident.session.execution.patientId,
        ProcedureEventName.CRITICAL_INCIDENT_ACKNOWLEDGED,
        {
          sessionId: incident.session.id,
          incidentId: incident.id,
          acknowledgedBy: actorId,
        },
      );
    });
  }
}
