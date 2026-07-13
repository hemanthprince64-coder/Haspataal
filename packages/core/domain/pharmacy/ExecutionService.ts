import { PrismaClient, PharmacyExecutionStatus, OrderStatus } from '@prisma/client';

export class PharmacyExecutionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Initializes a PharmacyExecution record for a canonical order.
   * This is typically triggered by an Outbox relay via `PharmacyConsumer`.
   */
  async initializeExecutionFromOrder(
    orderId: string,
    providedTx?: Prisma.TransactionClient,
  ): Promise<string> {
    const run = async (tx: Prisma.TransactionClient) => {
      // 1. Fetch the Order to ensure it exists and get context
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Check if it already exists (idempotency)
      const existing = await tx.pharmacyExecution.findUnique({
        where: { orderId },
      });

      if (existing) {
        return existing.id;
      }

      // 2. Filter for pharmacy-relevant order items
      const pharmacyItems = order.items.filter(
        (item) => item.status !== OrderStatus.REQUESTED && item.status !== OrderStatus.CANCELLED,
      );

      if (pharmacyItems.length === 0) {
        // Just return smoothly if no items to execute (e.g. order contains lab tests only)
        return 'no-op';
      }

      // 3. Create the Execution aggregate
      const execution = await tx.pharmacyExecution.create({
        data: {
          hospitalId: order.hospitalId,
          patientId: order.patientId,
          orderId: order.id,
          status: PharmacyExecutionStatus.PENDING_VERIFICATION,
          items: {
            create: pharmacyItems.map((item) => ({
              orderItemId: item.id,
              prescribedQuantity: item.quantity,
              dispensedQuantity: 0,
            })),
          },
        },
      });

      return execution.id;
    };

    if (providedTx) {
      return await run(providedTx);
    }
    return await this.prisma.$transaction(run);
  }

  /**
   * Cancel an execution, rolling back reservations if necessary.
   */
  async cancelExecution(orderId: string, providedTx?: Prisma.TransactionClient): Promise<void> {
    const run = async (tx: Prisma.TransactionClient) => {
      const execution = await tx.pharmacyExecution.findUnique({
        where: { orderId },
        include: { items: { include: { reservations: true } } },
      });

      if (!execution || execution.status === PharmacyExecutionStatus.CANCELLED) {
        return;
      }

      // Mark execution as cancelled
      await tx.pharmacyExecution.update({
        where: { id: execution.id },
        data: { status: PharmacyExecutionStatus.CANCELLED },
      });

      // Release any active reservations
      for (const item of execution.items) {
        const activeReservations = item.reservations.filter((r) => r.status === 'ACTIVE');
        for (const reservation of activeReservations) {
          await tx.stockReservation.update({
            where: { id: reservation.id },
            data: { status: 'RELEASED' },
          });

          // Restore inventory batch stock
          await tx.inventoryBatch.update({
            where: { id: reservation.batchId },
            data: { currentStock: { increment: reservation.quantity } },
          });
        }
      }
    };

    if (providedTx) {
      return await run(providedTx);
    }
    return await this.prisma.$transaction(run);
  }
}
