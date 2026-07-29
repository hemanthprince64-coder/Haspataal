import { PrismaClient, ProcedureExecutionStatus } from '@prisma/client';

export class ProcedureExecutionService {
  constructor(private prisma: PrismaClient) {}

  async provisionExecution(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Find the order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Check for PROCEDURE items
      const procedureItems = await tx.orderItem.findMany({
        where: {
          orderId,
          catalogVersion: {
            catalog: {
              type: 'PROCEDURE',
            },
          },
        },
      });

      if (procedureItems.length === 0) {
        return; // Nothing to provision
      }

      // Ensure execution doesn't exist
      const existing = await tx.procedureExecution.findUnique({
        where: { orderId },
      });

      if (existing) {
        return; // Already started
      }

      // Create ProcedureExecution
      await tx.procedureExecution.create({
        data: {
          hospitalId: order.hospitalId,
          patientId: order.patientId,
          orderId: order.id,
          status: ProcedureExecutionStatus.PENDING,
          items: {
            create: procedureItems.map((item) => ({
              orderItemId: item.id,
              catalogVersionId: item.catalogVersionId,
              status: ProcedureExecutionStatus.PENDING,
            })),
          },
        },
      });
    });
  }

  async cancelExecution(orderId: string, reason: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.procedureExecution.findUnique({
        where: { orderId },
        include: { items: true, appointment: true },
      });

      if (!execution) return;

      if (
        [
          ProcedureExecutionStatus.IN_PROGRESS,
          ProcedureExecutionStatus.RECOVERY,
          ProcedureExecutionStatus.COMPLETED,
        ].includes(execution.status)
      ) {
        throw new Error(`Cannot cancel execution in state ${execution.status}`);
      }

      await tx.procedureExecution.update({
        where: { id: execution.id },
        data: { status: ProcedureExecutionStatus.CANCELLED },
      });

      await tx.procedureExecutionItem.updateMany({
        where: { executionId: execution.id },
        data: { status: ProcedureExecutionStatus.CANCELLED },
      });

      if (execution.appointment) {
        await tx.procedureAppointment.update({
          where: { id: execution.appointment.id },
          data: { status: 'CANCELLED' },
        });
      }
    });
  }
}
