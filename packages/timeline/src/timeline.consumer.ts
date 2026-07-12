import { EventConsumer, CanonicalEventEnvelope, EventType } from '@haspataal/platform-contracts';
import { Prisma } from '@prisma/client';

export class TimelineConsumer implements EventConsumer {
  public readonly consumerName = 'Timeline';

  supportedEvents(): EventType[] {
    return [
      'PATIENT_ADMITTED',
      'PATIENT_CLINICALLY_DISCHARGED',
      'PATIENT_PHYSICALLY_LEFT_STANDARD',
      'PATIENT_PHYSICALLY_LEFT_LAMA',
      'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE',
      'ADD_TO_TIMELINE_COMMAND', // Legacy direct push via Outbox
    ];
  }

  async handle(envelope: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void> {
    const payload = envelope.payload as any;

    if (envelope.eventType === 'ADD_TO_TIMELINE_COMMAND') {
      const data = payload;
      await tx.timelineEvent.create({
        data: {
          patientId: data.patientId,
          hospitalId: data.hospitalId,
          doctorId: data.doctorId,
          module: data.module ?? 'UNKNOWN',
          entityType: data.entityType,
          entityId: data.entityId,
          eventType: data.eventType,
          category: data.category ?? 'UNKNOWN',
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          description: data.description,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          clinicalDate: data.clinicalDate ? new Date(data.clinicalDate) : null,
          priority: data.priority ?? 5,
          severity: data.severity ?? 'LOW',
          tags: data.tags ?? [],
          status: 'ACTIVE',
          metadata: data.metadata ?? {},
          projectionVersion: 1,
          lastProcessedEventId: envelope.eventId,
          lastProcessedOccurredAt: envelope.occurredAt,
        },
      });
      return;
    }

    const patientId = payload.patientId || payload.id;
    let title = '';
    let category = 'ADMISSION';
    let timelineModule = 'IPD';
    let severity = 'LOW';

    switch (envelope.eventType) {
      case 'PATIENT_ADMITTED':
        title = 'Patient Admitted';
        timelineModule = 'IPD';
        severity = 'LOW';
        break;
      case 'PATIENT_CLINICALLY_DISCHARGED':
        title = 'Clinical Discharge Authorized';
        category = 'DISCHARGE';
        break;
      case 'PATIENT_PHYSICALLY_LEFT_STANDARD':
        title = 'Patient Physically Departed';
        category = 'DISCHARGE';
        break;
      case 'PATIENT_PHYSICALLY_LEFT_LAMA':
        title = 'Patient Left Against Medical Advice (LAMA)';
        category = 'DISCHARGE';
        severity = 'HIGH';
        break;
      case 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE':
        title = 'Patient Absconded (Left Without Notice)';
        category = 'DISCHARGE';
        severity = 'CRITICAL';
        break;
    }

    await tx.timelineEvent.create({
      data: {
        patientId: patientId,
        hospitalId: envelope.scope.hospitalId,
        module: timelineModule,
        entityType: 'Admission',
        entityId: payload.admissionId,
        eventType: envelope.eventType,
        category: category,
        title: title,
        timestamp: envelope.occurredAt ?? new Date(),
        clinicalDate: envelope.occurredAt ?? undefined,
        severity: severity,
        status: 'ACTIVE',
        metadata: { payload },
        projectionVersion: 1,
        lastProcessedEventId: envelope.eventId ?? null,
        lastProcessedOccurredAt: envelope.occurredAt ?? null,
      },
    });
  }
}
