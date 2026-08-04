import { PrismaClient } from '@prisma/client';

import { FinancialReportingService } from '../reports/services/FinancialReportingService';

const prisma = new PrismaClient();

describe('FinancialReportingService', () => {
  let testHospitalId: string;

  beforeAll(async () => {
    const hospital = await prisma.hospitalsMaster.findFirst();
    if (!hospital) {
      console.warn('Need hospital in test DB, skipping setup');
      return;
    }
    testHospitalId = hospital.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fetch outstanding invoices', async () => {
    if (!testHospitalId) return; // Skip if no DB

    const outstanding = await FinancialReportingService.getOutstandingInvoices(testHospitalId);
    expect(Array.isArray(outstanding)).toBe(true);
  });
});
