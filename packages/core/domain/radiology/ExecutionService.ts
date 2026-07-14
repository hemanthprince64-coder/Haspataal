import { PrismaClient, OrderStatus } from '@prisma/client';

export class ExecutionService {
  constructor(private prisma: PrismaClient) {}

  async startExecution(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Find the order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Check for RADIOLOGY items
      const radiologyItems = await tx.orderItem.findMany({
        where: {
          orderId,
          catalogVersion: {
            catalog: {
              type: 'RADIOLOGY',
            },
          },
        },
      });

      if (radiologyItems.length === 0) {
        return; // Nothing to provision
      }

      // Ensure execution doesn't exist
      const existing = await tx.radiologyExecution.findUnique({
        where: { orderId },
      });

      if (existing) {
        return; // Already started
      }

      // Create RadiologyExecution
      await tx.radiologyExecution.create({
        data: {
          hospitalId: order.hospitalId,
          patientId: order.patientId,
          orderId: order.id,
          status: 'PENDING_SCHEDULING',
          items: {
            create: radiologyItems.map((item) => ({
              orderItemId: item.id,
              status: 'PENDING_SCHEDULING',
              modality: 'XRAY', // Default, should be parsed from catalog normally
            })),
          },
        },
      });
    });
  }

  async cancelExecution(orderId: string, reason: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.radiologyExecution.findUnique({
        where: { orderId },
        include: { items: true },
      });

      if (!execution) return;

      if (['ACQUIRED', 'REPORTING', 'REPORT_VERIFIED', 'RELEASED'].includes(execution.status)) {
        throw new Error(`Cannot cancel execution in state ${execution.status}`);
      }

      await tx.radiologyExecution.update({
        where: { id: execution.id },
        data: { status: 'CANCELLED' },
      });

      await tx.radiologyExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: 'CANCELLED' },
      });

      // Free up any appointments? Not deleting them to keep history, but cancel them
      if (execution.appointmentId) {
        await tx.radiologyAppointment.update({
          where: { id: execution.appointmentId },
          data: { status: 'CANCELLED' },
        });
      }
    });
  }
}
