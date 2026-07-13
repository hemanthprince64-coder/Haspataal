import { PrismaClient, PharmacyExecutionStatus } from '@prisma/client';

export class PharmacyDispenseService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Dispenses items for an execution, consuming the reservations.
   */
  async dispenseExecution(
    executionId: string,
    dispensedById: string,
    dispenses: { executionItemId: string; quantity: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.pharmacyExecution.findUnique({
        where: { id: executionId },
        include: {
          items: {
            include: { reservations: true },
          },
        },
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      if (
        execution.status === PharmacyExecutionStatus.COMPLETED ||
        execution.status === PharmacyExecutionStatus.CANCELLED
      ) {
        throw new Error(`Cannot dispense for execution in status ${execution.status}`);
      }

      // Create dispense record
      const dispenseRecord = await tx.pharmacyExecutionDispense.create({
        data: {
          executionId,
          dispensedById,
        },
      });

      let allItemsFullyDispensed = true;
      let atLeastOneItemPartiallyDispensed = false;

      for (const dispenseInput of dispenses) {
        const item = execution.items.find((i) => i.id === dispenseInput.executionItemId);
        if (!item) {
          throw new Error(
            `Execution item ${dispenseInput.executionItemId} not found in execution ${executionId}`,
          );
        }

        const quantityToDispense = dispenseInput.quantity;
        const requiredQuantity = item.prescribedQuantity - item.dispensedQuantity;

        if (quantityToDispense > requiredQuantity) {
          throw new Error(`Cannot dispense more than prescribed for item ${item.id}`);
        }

        const activeReservations = item.reservations.filter((r) => r.status === 'ACTIVE');
        let remainingToConsumeFromReservations = quantityToDispense;

        for (const reservation of activeReservations) {
          if (remainingToConsumeFromReservations <= 0) break;

          const consumedFromThisReservation = Math.min(
            reservation.quantity,
            remainingToConsumeFromReservations,
          );

          // Create dispense item
          await tx.pharmacyExecutionDispenseItem.create({
            data: {
              dispenseId: dispenseRecord.id,
              executionItemId: item.id,
              reservationId: reservation.id,
              quantityDispensed: consumedFromThisReservation,
            },
          });

          // Update reservation
          const newReservationQuantity = reservation.quantity - consumedFromThisReservation;
          await tx.stockReservation.update({
            where: { id: reservation.id },
            data: {
              quantity: newReservationQuantity,
              status: newReservationQuantity === 0 ? 'CONSUMED' : 'ACTIVE',
            },
          });

          remainingToConsumeFromReservations -= consumedFromThisReservation;
        }

        if (remainingToConsumeFromReservations > 0) {
          throw new Error(
            `Insufficient active reservations for item ${item.id} to dispense ${quantityToDispense}.`,
          );
        }

        // Update execution item dispensed quantity
        const newDispensedQuantity = item.dispensedQuantity + quantityToDispense;
        await tx.pharmacyExecutionItem.update({
          where: { id: item.id },
          data: { dispensedQuantity: newDispensedQuantity },
        });

        if (newDispensedQuantity < item.prescribedQuantity) {
          allItemsFullyDispensed = false;
        }

        if (newDispensedQuantity > 0) {
          atLeastOneItemPartiallyDispensed = true;
        }

        // Emit milestone event to Outbox
        await tx.outboxEvent.create({
          data: {
            aggregateType: 'ORDER',
            aggregateId: execution.orderId,
            eventType: 'MEDICATION_DISPENSED',
            payload: {
              executionId: execution.id,
              orderId: execution.orderId,
              orderItemId: item.orderItemId,
              dispenseItemId: dispenseRecord.id,
              quantity: quantityToDispense,
              dispensedAt: new Date().toISOString(),
              dispensedBy: dispensedById,
            },
          },
        });
      }

      // Compute new execution status
      let newStatus = execution.status;
      if (allItemsFullyDispensed) {
        newStatus = PharmacyExecutionStatus.FULLY_DISPENSED;
      } else if (atLeastOneItemPartiallyDispensed) {
        newStatus = PharmacyExecutionStatus.PARTIALLY_DISPENSED;
      }

      if (newStatus !== execution.status) {
        await tx.pharmacyExecution.update({
          where: { id: executionId },
          data: { status: newStatus },
        });
      }
    });
  }
}
