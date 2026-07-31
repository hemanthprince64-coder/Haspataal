import { PrismaClient, SampleType, SampleStatus, Prisma } from '@haspataal/db';
import { TimelinePublisher, TimelineEventType } from '@haspataal/timeline';

import { SampleStateMachine } from '../domain/state-machine/SampleStateMachine';

const prisma = new PrismaClient();
const timelinePublisher = new TimelinePublisher();

export interface CollectSampleDTO {
  clinicalOrderId: string;
  sampleType: SampleType;
  barcode: string;
  hospitalId: string;
  patientId: string;
  collectedBy: string;
}

export class CollectSampleUseCase {
  public async execute(data: CollectSampleDTO) {
    // 1. Verify barcode is unique
    const existingBarcode = await prisma.sample.findUnique({
      where: { barcode: data.barcode },
    });
    if (existingBarcode) {
      throw new Error(`Barcode ${data.barcode} is already in use.`);
    }

    // 2. Verify order exists and is valid for collection
    const order = await prisma.clinicalOrder.findUnique({
      where: { id: data.clinicalOrderId },
    });

    if (!order) {
      throw new Error('ClinicalOrder not found.');
    }
    if (order.hospitalId !== data.hospitalId) {
      throw new Error('Order does not belong to this hospital.');
    }

    // 3. Create sample in COLLECTED state
    // We skip COLLECTION_PENDING if created at collection time.
    const newSample = await prisma.sample.create({
      data: {
        clinicalOrderId: data.clinicalOrderId,
        hospitalId: data.hospitalId,
        patientId: data.patientId,
        sampleType: data.sampleType,
        barcode: data.barcode,
        status: SampleStatus.COLLECTED,
        collectedBy: data.collectedBy,
        collectedAt: new Date(),
      },
    });

    // 4. Update order status if it was ORDERED
    if (order.status === 'ORDERED') {
      await prisma.clinicalOrder.update({
        where: { id: order.id },
        data: { status: 'ACCEPTED' },
      });
    }

    // 5. Publish to Timeline
    await timelinePublisher.publish({
      patientId: data.patientId,
      encounterId: order.encounterId,
      hospitalId: data.hospitalId,
      eventType: 'SAMPLE_COLLECTED' as TimelineEventType,
      title: 'Sample Collected',
      description: `${data.sampleType} sample collected (Barcode: ${data.barcode}).`,
      actorId: data.collectedBy,
      payload: { sampleId: newSample.id, barcode: data.barcode },
    });

    return newSample;
  }
}
