import { PlaceClinicalOrderUseCase } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderType, OrderPriority } from '@haspataal/types';

export interface PlaceRadiologyOrderDTO {
  encounterId: string;
  patientId: string;
  hospitalId: string;
  doctorId?: string;
  priority?: OrderPriority;
  reason?: string;
  requestedBy: string;
  actorRole: string;
  actorName: string;
  modality: string; // Stored in order payload initially
}

export class PlaceRadiologyOrderUseCase {
  static async execute(data: PlaceRadiologyOrderDTO) {
    const result = await PlaceClinicalOrderUseCase.execute({
      encounterId: data.encounterId,
      patientId: data.patientId,
      hospitalId: data.hospitalId,
      doctorId: data.doctorId,
      type: 'RADIOLOGY' as ClinicalOrderType,
      priority: data.priority,
      reason: data.reason,
      payload: {
        modality: data.modality,
      },
      requestedBy: data.requestedBy,
      actorName: data.actorName,
      actorRole: data.actorRole,
    });

    if (!result.success || !result.order) {
      throw new Error(result.error || 'Failed to place radiology order');
    }

    const publisher = getTimelinePublisher();
    await publisher.publishStandardEvent({
      version: 1,
        eventVersion: 1,
        schemaVersion: 1,
      type: 'RADIOLOGY_ORDER_CREATED',
      patientId: data.patientId,
      hospitalId: data.hospitalId,
      encounterId: data.encounterId,
      aggregateType: 'ClinicalOrder',
      aggregateId: result.order.id,
      actor: {
        id: data.requestedBy,
        type: 'DOCTOR',
        name: data.actorName,
        role: data.actorRole,
      },
      occurredAt: new Date(),
      payload: {
        clinicalOrderId: result.order.id,
        reason: data.reason,
        priority: data.priority,
        modality: data.modality,
      },
    });

    return result.order;
  }
}
