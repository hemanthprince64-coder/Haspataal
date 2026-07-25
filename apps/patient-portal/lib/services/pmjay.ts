/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type, local-rules/no-direct-prisma-in-pages, @typescript-eslint/no-unused-vars */
import { logger } from '@haspataal/logger';

import { prisma } from '../util/prisma-singleton';

export interface PMJAYClaim {
  claimId: string;
  hospitalId: string;
  abhaId: string;
  patientName: string;
  admissionDate: string;
  dischargeDate: string;
  procedureCode: string;
  procedureName: string;
  claimAmount: number;
  status: 'INITIATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  supportingDocuments: Array<{
    documentType: string;
    fileUrl: string;
  }>;
}

/**
 * PMJAY Claim & Batch Export Service
 */
export async function generatePMJAYClaim(visitId: string): Promise<PMJAYClaim | null> {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
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

    if (!visit) {
      logger.error(`[PMJAY] Visit not found: ${visitId}`);
      return null;
    }

    const patient = (visit as any).appointment?.patient;
    const appointment = (visit as any).appointment;
    const hospital = (visit as any).hospital;
    const invoice = appointment?.invoices?.[0];
    const claimAmount = invoice ? Number(invoice.amount) : 0;

    // Construct standard PMJAY e-claim format
    const claim: PMJAYClaim = {
      claimId: `pmjay-clm-${visit.id.substring(0, 8)}-${Date.now().toString().slice(-4)}`,
      hospitalId: visit.hospitalId,
      abhaId: patient?.abhaAddress || 'GUEST-ABHA-DUMMY',
      patientName: patient?.name || 'Unknown Patient',
      admissionDate: visit.createdAt.toISOString(),
      dischargeDate: visit.createdAt.toISOString(), // Same-day OPD consultation default
      procedureCode: 'MED-OPD-01', // Standard code mapping
      procedureName: visit.diagnosis || 'OPD General Consultation',
      claimAmount,
      status: 'INITIATED',
      supportingDocuments: [
        {
          documentType: 'DISCHARGE_SUMMARY',
          fileUrl: `/reports/discharge-${visit.id}.pdf`,
        },
      ],
    };

    logger.info({ claim }, `[PMJAY] Generated e-claim for visit: ${visitId}`);
    return claim;
  } catch (err) {
    logger.error({ err }, '[PMJAY] Error generating claim:');
    return null;
  }
}

/**
 * Bundles multiple PMJAY claims into a JSON batch export for manual upload in air-gapped clinics
 */
export async function exportPMJAYBatch(
  hospitalId: string,
  startDate: Date,
  endDate: Date,
): Promise<string> {
  const visits = await prisma.visit.findMany({
    where: {
      hospitalId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { id: true },
  });

  const claims: PMJAYClaim[] = [];

  for (const v of visits) {
    const clm = await generatePMJAYClaim(v.id);
    if (clm) claims.push(clm);
  }

  const batchPayload = {
    batchId: `pmjay-btc-${hospitalId.substring(0, 5)}-${Date.now()}`,
    hospitalId,
    exportedAt: new Date().toISOString(),
    claimsCount: claims.length,
    totalAmount: claims.reduce((acc, c) => acc + c.claimAmount, 0),
    claims,
  };

  return JSON.stringify(batchPayload, null, 2);
}

