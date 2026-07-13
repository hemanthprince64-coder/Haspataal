import { PrismaClient, PharmacyExecutionStatus } from '@prisma/client';

export class PharmacyInventoryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Reserves stock for a verified pharmacy execution.
   * Uses First-Expired-First-Out (FEFO) logic.
   */
  async reserveStockForExecution(executionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.pharmacyExecution.findUnique({
        where: { id: executionId },
        include: {
          items: {
            include: {
              orderItem: true,
            },
          },
        },
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      if (execution.status !== PharmacyExecutionStatus.VERIFIED) {
        throw new Error(
          `Execution ${executionId} must be VERIFIED to reserve stock. Current status: ${execution.status}`,
        );
      }

      const now = new Date();

      for (const item of execution.items) {
        const requiredQuantity = item.prescribedQuantity - item.dispensedQuantity;
        if (requiredQuantity <= 0) continue;

        // Find inventory item
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: {
            hospitalId_catalogVersionId: {
              hospitalId: execution.hospitalId,
              catalogVersionId: item.orderItem.catalogVersionId,
            },
          },
        });

        if (!inventoryItem) {
          throw new Error(
            `No inventory mapping found for catalog version ${item.orderItem.catalogVersionId}`,
          );
        }

        // Fetch valid batches (FEFO)
        const batches = await tx.inventoryBatch.findMany({
          where: {
            inventoryItemId: inventoryItem.id,
            expiryDate: { gt: now },
            currentStock: { gt: 0 },
          },
          orderBy: {
            expiryDate: 'asc',
          },
        });

        let remainingToReserve = requiredQuantity;

        for (const batch of batches) {
          if (remainingToReserve <= 0) break;

          const quantityFromBatch = Math.min(batch.currentStock, remainingToReserve);

          // Create reservation
          await tx.stockReservation.create({
            data: {
              hospitalId: execution.hospitalId,
              batchId: batch.id,
              executionItemId: item.id,
              quantity: quantityFromBatch,
              status: 'ACTIVE',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reserve for 24h
            },
          });

          // Decrement batch stock
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: {
              currentStock: { decrement: quantityFromBatch },
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

      // Update execution status
      await tx.pharmacyExecution.update({
        where: { id: executionId },
        data: { status: PharmacyExecutionStatus.STOCK_RESERVED },
      });
    });
  }
}
