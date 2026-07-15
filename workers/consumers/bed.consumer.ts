import { EventConsumer, CanonicalEventEnvelope, EventType } from '@haspataal/platform-contracts';
import { Prisma } from '@prisma/client';

export class BedConsumer implements EventConsumer {
  public readonly consumerName = 'Bed';
  consumerVersion = 1;

  supportedEvents(): EventType[] {
    return [
      'PATIENT_PHYSICALLY_LEFT_STANDARD',
      'PATIENT_PHYSICALLY_LEFT_LAMA',
      'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE',
    ];
  }

  async handle(envelope: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void> {
    const payload = envelope.payload as any;
    const admissionId = payload.admissionId;

    if (!admissionId) return;

    // Find if the admission has a bed assigned
    const admission = await tx.admission.findUnique({
      where: { id: admissionId },
    });

    if (admission?.bedId) {
      await tx.bed.update({
        where: { id: admission.bedId },
        data: {
          status: 'CLEANING', // Set to cleaning per requirements
        },
      });
    }
  }
}
