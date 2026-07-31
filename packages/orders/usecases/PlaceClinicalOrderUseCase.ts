import { prisma } from '@haspataal/db';
import { EncounterGuard } from '@haspataal/encounter';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher } from '@haspataal/timeline';
import {
  ClinicalOrderType,
  ClinicalOrderStatus,
  OrderPriority,
  TimelineCategory,
  TimelineEventType,
} from '@haspataal/types';

export interface PlaceClinicalOrderDTO {
  encounterId: string;
  patientId: string;
  hospitalId: string;
  doctorId?: string;
  departmentId?: string;
  type: ClinicalOrderType;
  priority?: OrderPriority;
  reason?: string;
  payload?: any;
  requestedBy?: string;
}

export class PlaceClinicalOrderUseCase {
  static async execute(data: PlaceClinicalOrderDTO) {
    try {
      logger.info(`Placing ${data.type} order for patient ${data.patientId}`);

      const encounter = await EncounterGuard.requireActiveEncounter(data.encounterId);

      const order = await prisma.clinicalOrder.create({
        data: {
          encounterId: data.encounterId,
          patientId: encounter.patientId,
          hospitalId: encounter.hospitalId,
          doctorId: data.doctorId || encounter.doctorId,
          departmentId: data.departmentId || encounter.departmentId,
          type: data.type as any,
          status: ClinicalOrderStatus.ORDERED as any,
          priority: (data.priority || OrderPriority.ROUTINE) as any,
          reason: data.reason,
          payload: data.payload,
          requestedBy: data.requestedBy,
          requestedAt: new Date(),
        },
      });

      // Emit timeline event
      await getTimelinePublisher().publish({
        patientId: encounter.patientId,
        hospitalId: encounter.hospitalId,
        encounterId: encounter.id,
        aggregateType: 'ClinicalOrder',
        aggregateId: order.id,
        schemaVersion: 1,
        eventType: TimelineEventType.INVESTIGATION_REQUESTED,
        category: TimelineCategory.INVESTIGATION, // Broad category
        title: `${data.type} Order Placed`,
        summary: `A ${data.priority || 'ROUTINE'} ${data.type} order was placed.`,
        actorType: 'DOCTOR',
        actorId: data.requestedBy || 'system',
        payload: {
          orderId: order.id,
          type: data.type,
          priority: data.priority,
          reason: data.reason,
        },
      });

      return { success: true, order };
    } catch (error: any) {
      logger.error('Failed to place clinical order', error);
      return { success: false, error: error.message };
    }
  }
}
