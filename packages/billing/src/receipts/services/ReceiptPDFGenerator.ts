import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReceiptPDFGenerator {
  /**
   * Generates a PDF buffer from a receipt's immutable snapshot.
   * In a real system, this would use pdfmake, puppeteer, or similar.
   */
  public async generatePdfBuffer(receiptId: string, hospitalId: string): Promise<Buffer> {
    const receipt = await prisma.receipt.findUniqueOrThrow({
      where: { id: receiptId },
    });

    if (receipt.hospitalId !== hospitalId) {
      throw new Error('Hospital ID mismatch');
    }

    const template = await prisma.receiptTemplate.findUnique({
      where: { hospitalId },
    });

    const snapshot: any = receipt.snapshot;

    // Stub implementation: Just create a string representation.
    const textContent = `
      ====================================
      RECEIPT: ${receipt.receiptNumber}
      HOSPITAL: ${snapshot.hospital?.name}
      ${template?.headerText || ''}
      ====================================
      Patient: ${snapshot.patient?.name}
      Date: ${new Date(snapshot.generatedAt).toLocaleString()}
      
      Payments Applied:
      ${snapshot.allocations?.map((a: any) => `- Inv ${a.invoiceNumber} (${a.paymentMethod}): Rs ${a.amount}`).join('\n      ')}
      
      TOTAL AMOUNT: Rs ${receipt.totalAmount.toNumber()}
      
      ====================================
      ${template?.footerText || 'Thank you'}
      ${template?.termsAndConditions || ''}
    `;

    return Buffer.from(textContent, 'utf-8');
  }
}
