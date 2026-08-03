import { prisma } from '@haspataal/db';
import { EncounterGuard } from '@haspataal/encounter';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderType, ClinicalOrderStatus, OrderPriority } from '@haspataal/types';

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
  requestedBy: string;
  actorName?: string;
  actorRole?: string;
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
      await getTimelinePublisher().publishStandardEvent({
        version: 1,
        type: 'CLINICAL_ORDER_PLACED',
        patientId: encounter.patientId,
        hospitalId: encounter.hospitalId,
        encounterId: encounter.id,
        aggregateType: 'ClinicalOrder',
        aggregateId: order.id,
        actor: {
          id: data.requestedBy,
          type: data.actorRole || 'DOCTOR',
          name: data.actorName,
          role: data.actorRole,
        },
        occurredAt: new Date(),
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
