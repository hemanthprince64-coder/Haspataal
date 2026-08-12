import { PrismaClient, PharmacyExecutionStatus, Prisma } from '@prisma/client';

export class PharmacyInventoryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Reserves stock for a verified pharmacy execution.
   * Uses First-Expired-First-Out (FEFO) logic.
   */
  async reserveStockForExecution(executionId: string, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.pharmacyExecution.findUnique({
        where: { id: executionId },
        include: { items: { include: { orderItem: true } } },
      });

      if (!execution) throw new Error(`Execution ${executionId} not found`);

      if (execution.status !== PharmacyExecutionStatus.VERIFIED) {
        throw new Error(
          `Execution ${executionId} must be VERIFIED to reserve stock. Current status: ${execution.status}`,
        );
      }

      const now = new Date();

      for (const item of execution.items) {
        const requiredQuantity = item.prescribedQuantity - item.dispensedQuantity;
        if (requiredQuantity <= 0) continue;

        // Check for substitution
        const substitution = await tx.pharmacySubstitution.findFirst({
          where: { executionItemId: item.id },
          orderBy: { createdAt: 'desc' },
        });

        const effectiveCatalogVersionId = substitution
          ? substitution.substitutedCatalogVersionId
          : item.orderItem.catalogVersionId;

        const inventoryItem = await tx.inventoryItem.findUnique({
          where: {
            hospitalId_catalogVersionId: {
              hospitalId: execution.hospitalId,
              catalogVersionId: effectiveCatalogVersionId,
            },
          },
        });

        if (!inventoryItem) {
          throw new Error(
            `No inventory mapping found for catalog version ${item.orderItem.catalogVersionId}`,
          );
        }

        // Fetch valid batches (FEFO) - raw query since Prisma cannot filter on derived computed columns easily
        const batches = await tx.$queryRaw<
          Array<{
            id: string;
            physical_stock: number;
            reserved_stock: number;
            batch_number: string;
          }>
        >`
          SELECT id, physical_stock, reserved_stock, batch_number
          FROM inventory_batches
          WHERE inventory_item_id = ${inventoryItem.id}
            AND expiry_date > ${now}
            AND status = 'ACTIVE'
            AND (physical_stock - reserved_stock) > 0
          ORDER BY expiry_date ASC
        `;

        let remainingToReserve = requiredQuantity;

        for (const batch of batches) {
          if (remainingToReserve <= 0) break;

          const availableStock = batch.physical_stock - batch.reserved_stock;
          const quantityFromBatch = Math.min(availableStock, remainingToReserve);

          // Create reservation
          const reservation = await tx.stockReservation.create({
            data: {
              hospitalId: execution.hospitalId,
              batchId: batch.id,
              executionItemId: item.id,
              quantity: quantityFromBatch,
              status: 'ACTIVE',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reserve for 24h
            },
          });

          // Increment reserved stock
          const updatedBatch = await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { reservedStock: { increment: quantityFromBatch } },
          });

          // Ledger Transaction
          await tx.inventoryTransaction.create({
            data: {
              batchId: batch.id,
              type: 'RESERVE',
              quantity: -quantityFromBatch,
              balanceAfter: updatedBatch.physicalStock,
              referenceType: 'RESERVATION',
              referenceId: reservation.id,
              actorId,
            },
          });

          remainingToReserve -= quantityFromBatch;
        }

        if (remainingToReserve > 0) {
          throw new Error(
            `Insufficient stock for order item ${item.orderItemId}. Short by ${remainingToReserve}.`,
          );
        }
      }

      await tx.pharmacyExecution.update({
        where: { id: executionId },
        data: { status: PharmacyExecutionStatus.STOCK_RESERVED },
      });

      // Emit STOCK_RESERVED outbox event
      await tx.outboxEvent.create({
        data: {
          eventType: 'STOCK_RESERVED',
          payload: {
            aggregateId: execution.id,
            aggregateType: 'PHARMACY_EXECUTION',
            items: execution.items.map((i) => i.id),
          },
          aggregateType: 'PHARMACY_EXECUTION',
          aggregateId: execution.id,
          hospitalId: execution.hospitalId,
          actorId,
        },
      });
    });
  }

  /**
   * Releases stock reserved for an execution item.
   */
  async unreserveStock(
    reservationId: string,
    actorId: string,
    providedTx?: Prisma.TransactionClient,
  ): Promise<void> {
    const run = async (tx: Prisma.TransactionClient) => {
      const reservation = await tx.stockReservation.findUnique({
        where: { id: reservationId },
        include: { batch: true },
      });

      if (!reservation || reservation.status !== 'ACTIVE') return;

      // Release
      await tx.stockReservation.update({
        where: { id: reservationId },
        data: { status: 'RELEASED' },
      });

      // Decrement reserved stock
      const updatedBatch = await tx.inventoryBatch.update({
        where: { id: reservation.batchId },
        data: { reservedStock: { decrement: reservation.quantity } },
      });

      // Ledger Transaction
      await tx.inventoryTransaction.create({
        data: {
          batchId: reservation.batchId,
          type: 'UNRESERVE',
          quantity: reservation.quantity,
          balanceAfter: updatedBatch.physicalStock,
          referenceType: 'RESERVATION',
          referenceId: reservation.id,
          actorId,
        },
      });
    };

    if (providedTx) {
      await run(providedTx);
    } else {
      await this.prisma.$transaction(run);
    }
  }

  /**
   * Adjusts inventory (manual audit).
   */
  async adjustInventory(
    batchId: string,
    actualPhysicalStock: number,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const batch = await tx.inventoryBatch.findUnique({ where: { id: batchId } });
      if (!batch) throw new Error(`Batch ${batchId} not found`);

      const difference = actualPhysicalStock - batch.physicalStock;
      if (difference === 0) return;

      await tx.inventoryBatch.update({
        where: { id: batchId },
        data: { physicalStock: actualPhysicalStock },
      });

      await tx.inventoryTransaction.create({
        data: {
          batchId,
          type: 'ADJUSTMENT',
          quantity: difference,
          balanceAfter: actualPhysicalStock,
          referenceType: 'AUDIT',
          actorId,
        },
      });
    });
  }

  /**
   * Returns dispensed stock back into inventory.
   */
  async returnStock(
    dispenseItemId: string,
    quantityToReturn: number,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const dispenseItem = await tx.pharmacyExecutionDispenseItem.findUnique({
        where: { id: dispenseItemId },
        include: { reservation: true },
      });

      if (!dispenseItem || !dispenseItem.reservationId) {
        throw new Error('Cannot return stock without an associated reservation/batch mapping');
      }

      if (quantityToReturn > dispenseItem.quantityDispensed) {
        throw new Error('Cannot return more than dispensed');
      }

      // Decrement dispense quantity
      await tx.pharmacyExecutionDispenseItem.update({
        where: { id: dispenseItemId },
        data: { quantityDispensed: { decrement: quantityToReturn } },
      });

      // Increment physical stock
      const updatedBatch = await tx.inventoryBatch.update({
        where: { id: dispenseItem.reservation!.batchId },
        data: { physicalStock: { increment: quantityToReturn } },
      });

      // Ledger Transaction
      await tx.inventoryTransaction.create({
        data: {
          batchId: dispenseItem.reservation!.batchId,
          type: 'RETURN',
          quantity: quantityToReturn,
          balanceAfter: updatedBatch.physicalStock,
          referenceType: 'DISPENSE_RETURN',
          referenceId: dispenseItemId,
          actorId,
        },
      });
    });
  }
}
