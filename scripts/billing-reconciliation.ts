import { PrismaClient } from '@prisma/client';
import pino from 'pino';

const logger = pino({ name: 'billing-reconciliation', level: 'info' });
const prisma = new PrismaClient();

interface Discrepancy {
  type: string;
  hospitalId: string;
  patientId?: string;
  entityId: string;
  expected: number;
  actual: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

const discrepancies: Discrepancy[] = [];

function addDiscrepancy(d: Omit<Discrepancy, 'severity'> & { severity?: Discrepancy['severity'] }) {
  discrepancies.push({ ...d, severity: d.severity || 'MEDIUM' });
}

async function reconcileHospital(hospitalId: string) {
  logger.info({ hospitalId }, 'Reconciling hospital billing');

  const invoices = await prisma.invoice.findMany({
    where: { hospitalId, status: 'FINALIZED' },
    include: { lineItems: true, payments: true },
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);

  const admissions = await prisma.admission.findMany({
    where: { hospitalId, status: 'DISCHARGED' },
  });

  for (const admission of admissions) {
    const admissionInvoices = invoices.filter((inv) => inv.admissionId === admission.id);
    if (admissionInvoices.length === 0) {
      addDiscrepancy({
        type: 'MISSING_IPD_INVOICE',
        hospitalId,
        patientId: admission.patientId,
        entityId: admission.id,
        expected:
          Number(admission.dailyBedCharge ?? 0) *
          Math.max(
            1,
            Math.ceil(
              (admission.dischargedAt!.getTime() - admission.admittedAt.getTime()) / 86400000,
            ),
          ),
        actual: 0,
        severity: 'HIGH',
      });
    }
  }

  const pharmacyDispenses = await prisma.pharmacyDispense.findMany({
    where: { hospitalId },
    include: { invoice: true },
  });

  for (const dispense of pharmacyDispenses) {
    if (!dispense.invoiceId && dispense.totalAmount > 0) {
      addDiscrepancy({
        type: 'MISSING_PHARMACY_INVOICE',
        hospitalId,
        patientId: dispense.patientId,
        entityId: dispense.id,
        expected: Number(dispense.totalAmount),
        actual: 0,
        severity: 'HIGH',
      });
    }
  }

  const diagnosticOrders = await prisma.diagnosticOrder.findMany({
    where: { hospitalId },
    include: { invoices: true },
  });

  for (const order of diagnosticOrders) {
    if (order.invoices.length === 0 && Number(order.totalAmount) > 0) {
      addDiscrepancy({
        type: 'MISSING_DIAGNOSTIC_INVOICE',
        hospitalId,
        patientId: order.patientId,
        entityId: order.id,
        expected: Number(order.totalAmount),
        actual: 0,
        severity: 'HIGH',
      });
    }
  }

  logger.info(
    { totalInvoiced, totalPaid, discrepancyCount: discrepancies.length },
    'Reconciliation complete',
  );
}

async function runReconciliation() {
  logger.info('Starting billing reconciliation...');

  const hospitals = await prisma.hospitalsMaster.findMany({
    where: { accountStatus: 'ACTIVE' },
    select: { id: true },
  });

  for (const hospital of hospitals) {
    await reconcileHospital(hospital.id);
  }

  const high = discrepancies.filter((d) => d.severity === 'HIGH').length;
  const medium = discrepancies.filter((d) => d.severity === 'MEDIUM').length;
  const low = discrepancies.filter((d) => d.severity === 'LOW').length;

  console.log('\n=== BILLING RECONCILIATION REPORT ===\n');
  discrepancies.forEach((d) => {
    console.log(
      `[${d.severity}] ${d.type}: ${d.entityId} (expected: ${d.expected}, actual: ${d.actual})`,
    );
  });

  console.log(
    `\nSummary: ${discrepancies.length} discrepancies (${high} high, ${medium} medium, ${low} low)`,
  );

  if (high > 0) {
    console.log('\nAction Required: High-severity discrepancies must be resolved before launch.');
    process.exit(1);
  }
}

runReconciliation().catch((error) => {
  logger.error(error, 'Reconciliation failed');
  process.exit(1);
});
