import { PrismaClient } from '@haspataal/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvoiceNumberGenerator } from '../services/InvoiceNumberGenerator';

describe('InvoiceNumberGenerator', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    vi.clearAllMocks();
  });

  it('Invoice Number Race -> Resolves correctly when called concurrently', async () => {
    let internalCounter = 1000;
    const txMock = {
      hospitalsMaster: {
        update: vi.fn().mockImplementation(async () => {
          // Simulate atomic increment by using a JS lock-like behavior over an external variable
          // In real DB, the row lock prevents race conditions
          internalCounter++;
          return {
            invoicePrefix: 'INV-SKMCH',
            nextInvoiceNumber: internalCounter,
          };
        }),
      },
    };

    // Run 100 concurrent requests
    const promises = Array.from({ length: 100 }).map(() =>
      InvoiceNumberGenerator.generate(txMock as any, 'hosp-1'),
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(100);
    expect(txMock.hospitalsMaster.update).toHaveBeenCalledTimes(100);

    const year = new Date().getFullYear();

    // Check that we got 1001 to 1100 without duplicates
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBe(100);

    // Verify first and last exist
    expect(results).toContain(`INV-SKMCH-${year}-001001`);
    expect(results).toContain(`INV-SKMCH-${year}-001100`);
  });
});
