import { describe, it, expect, vi, beforeEach } from 'vitest';

import { generatePMJAYClaim, exportPMJAYBatch } from '../services/pmjay';
import { prisma } from '../util/prisma-singleton';

// Mock Prisma
vi.mock('../util/prisma-singleton', () => ({
  prisma: {
    visit: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('PMJAY e-claim service tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should map visit database records to standard PMJAY e-claims', async () => {
    const mockVisit = {
      id: 'visit-12345678',
      hospitalId: 'hosp-abc',
      createdAt: new Date('2026-06-14T10:00:00Z'),
      diagnosis: 'Malaria infection',
      appointment: {
        patient: {
          name: 'Amit Kumar',
          abhaAddress: 'amit@abdh',
        },
        invoices: [
          {
            amount: 250.0,
          },
        ],
      },
    };

    vi.mocked(prisma.visit.findUnique).mockResolvedValue(mockVisit as any);

    const claim = await generatePMJAYClaim('visit-12345678');

    expect(prisma.visit.findUnique).toHaveBeenCalledWith({
      where: { id: 'visit-12345678' },
      include: {
        hospital: true,
        appointment: {
          include: {
            patient: true,
            invoices: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    expect(claim).not.toBeNull();
    expect(claim!.abhaId).toBe('amit@abdh');
    expect(claim!.patientName).toBe('Amit Kumar');
    expect(claim!.claimAmount).toBe(250.0);
    expect(claim!.procedureName).toBe('Malaria infection');
    expect(claim!.procedureCode).toBe('MED-OPD-01');
  });

  it('should export a valid JSON batch of PMJAY claims', async () => {
    const mockVisits = [{ id: 'visit-1' }, { id: 'visit-2' }];

    vi.mocked(prisma.visit.findMany).mockResolvedValue(mockVisits as any);

    const mockVisit1 = {
      id: 'visit-1',
      hospitalId: 'hosp-abc',
      createdAt: new Date('2026-06-14T10:00:00Z'),
      diagnosis: 'Tuberculosis check',
      appointment: {
        patient: {
          name: 'Rahul Kumar',
          abhaAddress: 'rahul@abdh',
        },
        invoices: [{ amount: 150.0 }],
      },
    };

    const mockVisit2 = {
      id: 'visit-2',
      hospitalId: 'hosp-abc',
      createdAt: new Date('2026-06-14T10:05:00Z'),
      diagnosis: 'Pediatric fever',
      appointment: {
        patient: {
          name: 'Sonia Kumari',
          abhaAddress: 'sonia@abdh',
        },
        invoices: [{ amount: 300.0 }],
      },
    };

    vi.mocked(prisma.visit.findUnique)
      .mockResolvedValueOnce(mockVisit1 as any)
      .mockResolvedValueOnce(mockVisit2 as any);

    const batchJson = await exportPMJAYBatch('hosp-abc', new Date(), new Date());
    const batch = JSON.parse(batchJson);

    expect(batch.claimsCount).toBe(2);
    expect(batch.totalAmount).toBe(450.0);
    expect(batch.claims[0].patientName).toBe('Rahul Kumar');
    expect(batch.claims[1].patientName).toBe('Sonia Kumari');
  });
});
