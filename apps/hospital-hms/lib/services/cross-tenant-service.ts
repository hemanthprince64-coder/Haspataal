import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// -----------------------------------------------------------------------------
// CROSS-TENANT NETWORK OPERATIONS SERVICE
// -----------------------------------------------------------------------------
// This service deliberately instantiates a secondary Prisma Client without RLS
// middleware, or uses a dedicated database role, specifically for operations
// that must safely cross hospital tenant boundaries (e.g., Stock Transfers).
//
// IMPORTANT: This service must ONLY be called by highly restricted background
// workers, API routes protected by NetworkAdmin roles, or the event bus saga
// orchestrator. It should NEVER be exposed directly to standard hospital users.
// -----------------------------------------------------------------------------

const systemPrisma = new PrismaClient({
  log: ['warn', 'error'],
});

export class NetworkOperationsService {
  /**
   * Executes the DISPATCH phase of a stock transfer.
   * Deducts inventory from the Source Hospital.
   */
  async dispatchTransfer(
    transferId: string,
    sourceHospitalId: string,
    drugId: string,
    batchNumber: string,
    quantity: number,
    actorId: string,
  ) {
    console.log('Initiating cross-tenant stock dispatch', { transferId, sourceHospitalId });

    try {
      // 1. Transactionally lock and deduct from Source
      await systemPrisma.$transaction(async (tx) => {
        // In a real implementation, we'd use raw SQL for pessimistic row locking:
        // await tx.$executeRaw`SELECT quantity FROM drug_stocks WHERE hospital_id = ${sourceHospitalId} AND drug_id = ${drugId} AND batch_number = ${batchNumber} FOR UPDATE`;

        const stockItem = await tx.drugStock.findFirst({
          where: { hospitalId: sourceHospitalId, name: drugId, batchNumber },
        });

        if (!stockItem || stockItem.stock < quantity) {
          throw new Error('Insufficient stock for cross-tenant transfer dispatch');
        }

        await tx.drugStock.update({
          where: { id: stockItem.id },
          data: { stock: stockItem.stock - quantity },
        });

        // Write Audit Log
        await tx.auditLog.create({
          data: {
            id: uuidv4(),
            hospitalId: sourceHospitalId,
            userId: actorId,
            action: 'DISPATCH_CROSS_TENANT_TRANSFER',
            entity: 'drug_stock',
            entityId: stockItem.id,
            details: { transferId, quantity, batchNumber } as any,
          },
        });
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to dispatch cross-tenant transfer', { transferId, error: err.message });
      throw err;
    }
  }

  /**
   * Executes the RECEIVE phase of a stock transfer.
   * Adds inventory to the Destination Hospital.
   */
  async receiveTransfer(
    transferId: string,
    destHospitalId: string,
    drugId: string,
    batchNumber: string,
    quantity: number,
    expiryDate: Date,
    actorId: string,
  ) {
    console.log('Initiating cross-tenant stock receive', { transferId, destHospitalId });

    try {
      // 1. Transactionally add to Destination
      await systemPrisma.$transaction(async (tx) => {
        const existingStock = await tx.drugStock.findFirst({
          where: { hospitalId: destHospitalId, name: drugId, batchNumber },
        });

        if (existingStock) {
          await tx.drugStock.update({
            where: { id: existingStock.id },
            data: { stock: existingStock.stock + quantity },
          });
        } else {
          await tx.drugStock.create({
            data: {
              hospitalId: destHospitalId,
              name: drugId,
              batchNumber,
              stock: quantity,
              expiryDate,
            },
          });
        }

        // Write Audit Log
        await tx.auditLog.create({
          data: {
            id: uuidv4(),
            hospitalId: destHospitalId,
            userId: actorId,
            action: 'RECEIVE_CROSS_TENANT_TRANSFER',
            entity: 'drug_stock',
            entityId: existingStock ? existingStock.id : 'new',
            details: { transferId, quantity, batchNumber } as any,
          },
        });
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to receive cross-tenant transfer', { transferId, error: err.message });
      throw err;
    }
  }
}

export const networkOpsService = new NetworkOperationsService();
