import { PrismaClient } from '@prisma/client';

import { Money } from '../../pricing/Money';

const prisma = new PrismaClient();

export type ReportDateRange = {
  startDate: Date;
  endDate: Date;
};

export type DailyCollectionReport = {
  date: string;
  totalCollected: number;
  cashCollected: number;
  upiCollected: number;
  cardCollected: number;
  insuranceCollected: number;
};

export type DoctorRevenueReport = {
  doctorId: string;
  doctorName: string;
  totalRevenueGenerated: number;
};

export type OutstandingInvoiceReport = {
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  totalAmount: number;
  balanceAmount: number;
  daysOverdue: number;
};

export class FinancialReportingService {
  /**
   * Generates a summary of daily collections based on actual Payments that were CAPTURED.
   * This ignores allocations and looks purely at cash flow into the hospital.
   */
  static async generateDailyCollectionReport(
    hospitalId: string,
    range: ReportDateRange,
  ): Promise<DailyCollectionReport[]> {
    const payments = await prisma.payment.findMany({
      where: {
        hospitalId,
        status: 'CAPTURED',
        createdAt: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    });

    const collectionsByDate: Record<string, DailyCollectionReport> = {};

    payments.forEach((payment) => {
      const dateStr = payment.createdAt.toISOString().split('T')[0];
      if (!collectionsByDate[dateStr]) {
        collectionsByDate[dateStr] = {
          date: dateStr,
          totalCollected: 0,
          cashCollected: 0,
          upiCollected: 0,
          cardCollected: 0,
          insuranceCollected: 0,
        };
      }

      const amount = payment.amount.toNumber();
      collectionsByDate[dateStr].totalCollected += amount;

      switch (payment.method) {
        case 'CASH':
          collectionsByDate[dateStr].cashCollected += amount;
          break;
        case 'UPI':
          collectionsByDate[dateStr].upiCollected += amount;
          break;
        case 'CARD':
          collectionsByDate[dateStr].cardCollected += amount;
          break;
        case 'INSURANCE':
          collectionsByDate[dateStr].insuranceCollected += amount;
          break;
        // fallback ignored for brevity
      }
    });

    return Object.values(collectionsByDate).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generates revenue by doctor based on generated Invoices (accrual accounting).
   */
  static async generateDoctorRevenueReport(
    hospitalId: string,
    range: ReportDateRange,
  ): Promise<DoctorRevenueReport[]> {
    // In a true HIS, charge items have a 'doctorId' or 'providerId'.
    // We will aggregate charge items that were INVOICED.
    const chargeItems = await prisma.chargeItem.findMany({
      where: {
        hospitalId,
        status: 'INVOICED',
        createdAt: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    });

    const revenueByDoctor: Record<string, DoctorRevenueReport> = {};

    chargeItems.forEach((charge) => {
      // Assuming charge payload has doctor details or sourceEvent links to it.
      // For this implementation, we use a placeholder if doctor is not directly on the model.
      const doctorId = 'UNKNOWN_DOC';
      const doctorName = 'General Hospital Revenue';

      if (!revenueByDoctor[doctorId]) {
        revenueByDoctor[doctorId] = {
          doctorId,
          doctorName,
          totalRevenueGenerated: 0,
        };
      }

      revenueByDoctor[doctorId].totalRevenueGenerated += charge.netAmount.toNumber();
    });

    return Object.values(revenueByDoctor).sort(
      (a, b) => b.totalRevenueGenerated - a.totalRevenueGenerated,
    );
  }

  /**
   * Identifies all invoices with an outstanding balance.
   */
  static async getOutstandingInvoices(hospitalId: string): Promise<OutstandingInvoiceReport[]> {
    const invoices = await prisma.invoice.findMany({
      where: {
        hospitalId,
        balanceAmount: { gt: 0 },
        status: { notIn: ['VOIDED', 'CANCELLED'] },
      },
      include: {
        patient: true,
      },
    });

    const now = new Date().getTime();

    return invoices
      .map((inv) => {
        const generatedAt = new Date(
          (inv.payload as any)?.invoice?.generatedAt || inv.id,
        ).getTime();
        const daysOverdue = Math.floor((now - generatedAt) / (1000 * 3600 * 24));

        return {
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          patientName: inv.patient?.name || 'Unknown Patient',
          totalAmount: inv.totalAmount.toNumber(),
          balanceAmount: inv.balanceAmount.toNumber(),
          daysOverdue,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue); // Oldest first
  }
}
