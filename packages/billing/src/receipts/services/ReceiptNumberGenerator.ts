import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReceiptNumberGenerator {
  /**
   * Generates a thread-safe sequential receipt number for a hospital.
   * If a transaction is provided, the lock is held until the transaction completes,
   * guaranteeing no gaps or duplicates.
   */
  public async generateNext(hospitalId: string, tx?: any): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const defaultPrefix = `RCT-${year}-`;

    // Ensure a sequence exists
    await client.receiptSequence.upsert({
      where: { hospitalId },
      update: {},
      create: {
        hospitalId,
        prefix: defaultPrefix,
        currentValue: 0,
      },
    });

    // Atomically increment and return the new value
    const updatedSequence = await client.receiptSequence.update({
      where: { hospitalId },
      data: {
        currentValue: { increment: 1 },
      },
    });

    return `${updatedSequence.prefix}${String(updatedSequence.currentValue).padStart(6, '0')}`;
  }
}
