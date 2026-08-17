import { prisma } from '@haspataal/db';
import { UpdateClinicalOrderStatusUseCase } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

export interface ScheduleStudyDTO {
  clinicalOrderId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  modality: string;
  scheduledAt: Date;
}

export class ScheduleStudyUseCase {
  static async execute(data: ScheduleStudyDTO) {
    const order = await prisma.clinicalOrder.findUnique({
      where: { id: data.clinicalOrderId },
      include: {
        encounter: true,
      },
    });

    if (!order) {
      throw new Error('ClinicalOrder not found');
    }

    if (order.status !== ClinicalOrderStatus.ORDERED) {
      throw new Error(`Cannot schedule study. Order is currently in ${order.status}`);
    }

    // 1. Create ImagingStudy
    const study = await prisma.imagingStudy.create({
      data: {
        clinicalOrderId: order.id,
        encounterId: order.encounterId,
        patientId: order.patientId,
        hospitalId: order.hospitalId,
        modality: data.modality,
        status: 'SCHEDULED',
        scheduledAt: data.scheduledAt,
        scheduledBy: data.actorId,
        accessionNumber: `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      },
    });

    // 2. Transition ClinicalOrder to ACCEPTED
    await UpdateClinicalOrderStatusUseCase.execute({
      orderId: order.id,
      status: ClinicalOrderStatus.ACCEPTED,
      version: order.version,
      actorId: data.actorId,
      actorName: data.actorName,
      actorRole: data.actorRole,
    });

    // 3. Emit Timeline Event
    const publisher = getTimelinePublisher();
    await publisher.publishStandardEvent({
      version: 1,
        eventVersion: 1,
        schemaVersion: 1,
      type: 'IMAGING_STUDY_SCHEDULED',
      patientId: order.patientId,
      hospitalId: order.hospitalId || undefined,
      encounterId: order.encounterId || undefined,
      aggregateType: 'ImagingStudy',
      aggregateId: study.id,
      actor: {
        id: data.actorId,
        type: 'TECHNICIAN',
        name: data.actorName,
        role: data.actorRole,
      },
      occurredAt: new Date(),
      payload: {
        clinicalOrderId: order.id,
        studyId: study.id,
        modality: data.modality,
        scheduledAt: data.scheduledAt,
      },
    });

    return study;
  }
}
