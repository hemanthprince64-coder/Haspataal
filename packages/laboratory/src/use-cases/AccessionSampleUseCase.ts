import { PrismaClient, SampleStatus, ClinicalOrderStatus } from '@haspataal/db';

import { SampleStateMachine } from '../domain/state-machine/SampleStateMachine';

const prisma = new PrismaClient();

export interface AccessionSampleDTO {
  sampleId: string;
  hospitalId: string;
  accessionedBy: string;
}

export class AccessionSampleUseCase {
  public async execute(data: AccessionSampleDTO) {
    // 1. Find sample
    const sample = await prisma.sample.findUnique({
      where: { id: data.sampleId },
      include: { clinicalOrder: { include: { samples: true } } },
    });

    if (!sample) throw new Error('Sample not found');
    if (sample.hospitalId !== data.hospitalId) throw new Error('Hospital mismatch');

    // 2. Validate state machine transition
    SampleStateMachine.validateTransition(sample.status, SampleStatus.ACCESSIONED);

    // 3. Update sample using transaction to also update Order if necessary
    const updatedSample = await prisma.$transaction(async (tx) => {
      const accSample = await tx.sample.update({
        where: { id: data.sampleId },
        data: {
          status: SampleStatus.ACCESSIONED,
          accessionedBy: data.accessionedBy,
          accessionedAt: new Date(),
        },
      });

      // Task 3.2: Ensure multiple samples correctly trigger ClinicalOrder transition to IN_PROGRESS
      // If ALL samples for this order are at least ACCESSIONED, order becomes IN_PROGRESS
      const allSamples = await tx.sample.findMany({
        where: { clinicalOrderId: sample.clinicalOrderId },
      });

      const allAccessionedOrFurther = allSamples.every((s) =>
        [SampleStatus.ACCESSIONED, SampleStatus.PROCESSING, SampleStatus.COMPLETED].includes(
          s.status,
        ),
      );

      if (
        allAccessionedOrFurther &&
        sample.clinicalOrder.status !== ClinicalOrderStatus.IN_PROGRESS &&
        sample.clinicalOrder.status !== ClinicalOrderStatus.VERIFIED
      ) {
        await tx.clinicalOrder.update({
          where: { id: sample.clinicalOrderId },
          data: { status: ClinicalOrderStatus.IN_PROGRESS },
        });
      }

      return accSample;
    });

    return updatedSample;
  }
}
