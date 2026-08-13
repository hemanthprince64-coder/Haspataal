import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

import { ClinicalOrderStateMachine } from '../statemachine/ClinicalOrderStateMachine';

export interface UpdateClinicalOrderStatusDTO {
  orderId: string;
  status: ClinicalOrderStatus;
  version: number;
  actorId: string;
  actorName: string;
  actorRole: string;
  reason?: string;
}

export class UpdateClinicalOrderStatusUseCase {
  static async execute(data: UpdateClinicalOrderStatusDTO) {
    try {
      logger.info(`Updating order ${data.orderId} to status ${data.status}`);

      const existingOrder = await prisma.clinicalOrder.findUnique({
        where: { id: data.orderId },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      ClinicalOrderStateMachine.validateTransition(
        existingOrder.status as ClinicalOrderStatus,
        data.status,
      );

      // Prepare fields to update based on status
      const updateData: any = {
        status: data.status as any,
        version: { increment: 1 },
      };

      if (data.status === ClinicalOrderStatus.ACCEPTED) {
        updateData.assignedTo = data.actorId;
      } else if (data.status === ClinicalOrderStatus.SCHEDULED) {
        updateData.scheduledAt = new Date();
      } else if (data.status === ClinicalOrderStatus.IN_PROGRESS) {
        updateData.startedAt = new Date();
        updateData.performedBy = data.actorId;
      } else if (data.status === ClinicalOrderStatus.COMPLETED) {
        updateData.completedAt = new Date();
        updateData.verifiedBy = data.actorId;
      } else if (
        data.status === ClinicalOrderStatus.CANCELLED ||
        data.status === ClinicalOrderStatus.REJECTED
      ) {
        updateData.cancelledAt = new Date();
        updateData.reason = data.reason;
      }

      const updateResult = await prisma.clinicalOrder.updateMany({
        where: { id: data.orderId, version: data.version },
        data: updateData,
      });

      if (updateResult.count === 0) {
        throw new Error(
          'CONCURRENCY_ERROR: The order has been modified by another process. Please refresh and try again.',
        );
      }

      const order = await prisma.clinicalOrder.findUnique({
        where: { id: data.orderId },
      });

      if (!order) throw new Error('Order not found after update');

      // Emit timeline event based on the new status
      await getTimelinePublisher().publishStandardEvent({
        schemaVersion: 1,
        eventVersion: 1,
        version: 1,
        type: `CLINICAL_ORDER_${data.status}`,
        patientId: order.patientId,
        hospitalId: order.hospitalId || undefined,
        encounterId: order.encounterId || undefined,
        aggregateType: 'ClinicalOrder',
        aggregateId: order.id,
        actor: {
          id: data.actorId,
          type: data.actorRole,
          name: data.actorName,
          role: data.actorRole,
        },
        occurredAt: new Date(),
        payload: {
          orderId: order.id,
          status: data.status,
          reason: data.reason,
        },
      });

      return { success: true, order };
    } catch (error: any) {
      logger.error(error, 'Failed to update clinical order status');
      return { success: false, error: error.message };
    }
  }
}
