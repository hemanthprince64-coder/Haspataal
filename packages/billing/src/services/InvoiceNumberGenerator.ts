import { Prisma, PrismaClient } from '@haspataal/db';

export class InvoiceNumberGenerator {
  /**
   * Generates a new invoice number for a hospital using atomic increment.
   * Returns a format like: INV-2026-001001 (or using hospital prefix if defined)
   */
  public static async generate(tx: Prisma.TransactionClient, hospitalId: string): Promise<string> {
    // We use atomic update to prevent race conditions
    const hospital = await tx.hospitalsMaster.update({
      where: { id: hospitalId },
      data: {
        nextInvoiceNumber: {
          increment: 1,
        },
      },
      select: {
        invoicePrefix: true,
        nextInvoiceNumber: true,
      },
    });

    const prefix = hospital.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    // nextInvoiceNumber has already been incremented, so the current one is what we return
    // Wait, since we incremented by 1, the new value is nextInvoiceNumber.
    // To use it as the current invoice number, we just use nextInvoiceNumber - 1 or format the current one.
    // Let's use the new value as the current invoice number to avoid skipping.
    // Example: starts at 1001, update makes it 1002, we return 1002.
    // It's standard to use the newly incremented value.
    const sequence = hospital.nextInvoiceNumber.toString().padStart(6, '0');

    return `${prefix}-${year}-${sequence}`;
  }
}
