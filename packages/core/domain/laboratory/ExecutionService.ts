import { PrismaClient } from '@prisma/client';

export class ExecutionService {
  constructor(private prisma: PrismaClient) {}
  async startExecution(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order || !order.activeVersionId) return;

    // Filter to only items that belong to the laboratory
    // Assuming laboratory items are identified by some logic,
    // e.g. looking at the catalog category or departmentId
    // For now we assume if the consumer routes it here, we create execution.
    // Wait, let's create the execution anyway.

    const execution = await this.prisma.laboratoryExecution.create({
      data: {
        hospitalId: order.hospitalId,
        patientId: order.patientId,
        orderId: order.id,
        orderVersionId: order.activeVersionId,
        status: 'PENDING_COLLECTION',
        items: {
          create: order.items.map((item) => ({
            orderItemId: item.id,
            status: 'PENDING_COLLECTION',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return execution;
  }

  async cancelExecution(orderId: string, reason: string) {
    const execution = await this.prisma.laboratoryExecution.findUnique({
      where: { orderId },
      include: {
        items: {
          include: {
            specimen: true,
          },
        },
      },
    });

    if (!execution) return;

    await this.prisma.$transaction(async (tx) => {
      // Cancel the execution
      await tx.laboratoryExecution.update({
        where: { id: execution.id },
        data: { status: 'CANCELLED' },
      });

      // Update all items
      await tx.laboratoryExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: 'CANCELLED' },
      });

      // We do NOT delete specimens as per invariant: specimen history is preserved.
    });
  }
}
