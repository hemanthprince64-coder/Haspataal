import { EventConsumer, CanonicalEventEnvelope, EventType } from '@haspataal/platform-contracts';
import { Prisma } from '@prisma/client';

export class AnalyticsConsumer implements EventConsumer {
  public readonly consumerName = 'Analytics';

  supportedEvents(): EventType[] {
    return [
      'PATIENT_REGISTERED',
      'PATIENT_ADMITTED',
      'PATIENT_CLINICALLY_DISCHARGED',
      'PATIENT_PHYSICALLY_LEFT_STANDARD',
      'PATIENT_PHYSICALLY_LEFT_LAMA',
      'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE',
    ];
  }

  async handle(envelope: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void> {
    const payload = envelope.payload as any;

    if (envelope.eventType === 'PATIENT_REGISTERED') {
      const patientId = payload.id || payload.patientId;
      await tx.analyticsPatientProjection.upsert({
        where: { patientId },
        create: {
          patientId,
          projectionVersion: 1,
          lastProcessedEventId: envelope.eventId,
          lastProcessedOccurredAt: envelope.occurredAt ?? new Date(),
        },
        update: {
          lastProcessedEventId: envelope.eventId,
          lastProcessedOccurredAt: envelope.occurredAt ?? new Date(),
        },
      });
      return;
    }

    if (
      [
        'PATIENT_ADMITTED',
        'PATIENT_CLINICALLY_DISCHARGED',
        'PATIENT_PHYSICALLY_LEFT_STANDARD',
        'PATIENT_PHYSICALLY_LEFT_LAMA',
        'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE',
      ].includes(envelope.eventType)
    ) {
      const patientId = payload.patientId || payload.id;
      const admissionId = payload.admissionId;

      if (!admissionId) return;

      const patientProj = await tx.analyticsPatientProjection.findUnique({ where: { patientId } });
      if (!patientProj) {
        await tx.analyticsPatientProjection.create({
          data: {
            patientId,
            totalAdmissions: 1,
            firstVisitDate: envelope.occurredAt ?? new Date(),
            lastVisitDate: envelope.occurredAt ?? new Date(),
            projectionVersion: 1,
            lastProcessedEventId: envelope.eventId,
            lastProcessedOccurredAt: envelope.occurredAt ?? new Date(),
          },
        });
      } else if (envelope.eventType === 'PATIENT_ADMITTED') {
        await tx.analyticsPatientProjection.update({
          where: { patientId },
          data: {
            totalAdmissions: { increment: 1 },
            lastVisitDate: envelope.occurredAt ?? new Date(),
          },
        });
      } else if (envelope.eventType === 'PATIENT_PHYSICALLY_LEFT_LAMA') {
        await tx.analyticsPatientProjection.update({
          where: { patientId },
          data: { totalLamas: { increment: 1 } },
        });
      }

      const existingAdmission = await tx.analyticsAdmissionProjection.findUnique({
        where: { admissionId },
      });

      const isPhysical = envelope.eventType.startsWith('PATIENT_PHYSICALLY_LEFT');
      const isLama = envelope.eventType === 'PATIENT_PHYSICALLY_LEFT_LAMA';
      const isAbsconded = envelope.eventType === 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE';

      let departureType = 'STANDARD';
      if (isLama) departureType = 'LAMA';
      if (isAbsconded) departureType = 'ABSCONDED';

      if (!existingAdmission) {
        await tx.analyticsAdmissionProjection.create({
          data: {
            admissionId,
            patientId,
            hospitalId: envelope.scope.hospitalId ?? 'UNKNOWN',
            admissionDate:
              envelope.eventType === 'PATIENT_ADMITTED'
                ? (envelope.occurredAt ?? new Date())
                : new Date(),
            clinicalDischargeDate:
              envelope.eventType === 'PATIENT_CLINICALLY_DISCHARGED' ? envelope.occurredAt : null,
            physicalDepartureDate: isPhysical ? envelope.occurredAt : null,
            departureType: isPhysical ? departureType : null,
            projectionVersion: 1,
            lastProcessedEventId: envelope.eventId,
            lastProcessedOccurredAt: envelope.occurredAt ?? new Date(),
          },
        });
      } else {
        await tx.analyticsAdmissionProjection.update({
          where: { admissionId },
          data: {
            clinicalDischargeDate:
              envelope.eventType === 'PATIENT_CLINICALLY_DISCHARGED'
                ? envelope.occurredAt
                : existingAdmission.clinicalDischargeDate,
            physicalDepartureDate: isPhysical
              ? envelope.occurredAt
              : existingAdmission.physicalDepartureDate,
            departureType: isPhysical ? departureType : existingAdmission.departureType,
            lastProcessedEventId: envelope.eventId,
            lastProcessedOccurredAt: envelope.occurredAt ?? new Date(),
          },
        });
      }
    }
  }
}
