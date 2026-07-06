import { PlatformCommand, createPlatformCommandSchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { SearchService } from './application/services/search-service';

export const SeedCommandPayloadSchema = z.object({
  action: z.enum(['seed-catalog', 'seed-all', 'index-medicine', 'index-investigation']),
  drugId: z.string().optional(),
  drugName: z.string().optional(),
  genericName: z.string().optional(),
  strength: z.string().optional(),
  formulation: z.string().optional(),
  testId: z.string().optional(),
  testName: z.string().optional(),
  testCode: z.string().optional(),
  sampleType: z.string().optional(),
  fastingRequired: z.boolean().optional(),
});

export const SeedCommandSchema = createPlatformCommandSchema(SeedCommandPayloadSchema);

export class SeedCommandHandler {
  constructor(private searchService: SearchService) {}

  async handleSeedCommand(rawCommand: unknown) {
    const command = SeedCommandSchema.parse(rawCommand) as PlatformCommand<z.infer<typeof SeedCommandPayloadSchema>>;
    const { action } = command.payload;
    const { prisma } = await import('@haspataal/db');

    if (action === 'seed-catalog') {
      await this.seedMedicineCatalog(prisma);
      await this.seedInvestigationCatalog(prisma);
      return { success: true, message: 'Catalogs seeded successfully' };
    }

    if (action === 'seed-all') {
      await this.seedMedicineCatalog(prisma);
      await this.seedInvestigationCatalog(prisma);
      await this.seedPatients(prisma);
      await this.seedDoctors(prisma);
      await this.seedAppointments(prisma);
      await this.seedTimelineEvents(prisma);
      await this.seedInvoices(prisma);
      await this.seedLabOrders(prisma);
      await this.seedPrescriptions(prisma);
      return { success: true, message: 'All entities seeded successfully' };
    }

    if (action === 'index-medicine') {
      const { drugId, drugName, genericName, strength, formulation } = command.payload;
      await this.searchService.index({
        entityType: 'medicine',
        entityId: drugId!,
        title: drugName!,
        content: `${genericName || ''} ${strength || ''} ${formulation || ''}`.trim(),
        metadata: { genericName, strength, formulation },
      });
      return { success: true };
    }

    if (action === 'index-investigation') {
      const { testId, testName, testCode, sampleType, fastingRequired } = command.payload;
      await this.searchService.index({
        entityType: 'investigation',
        entityId: testId!,
        title: testName!,
        content: `${testCode || ''} ${sampleType || ''}`.trim(),
        metadata: { testCode, sampleType, fastingRequired },
      });
      return { success: true };
    }

    throw new Error('Unknown action');
  }

  private async seedMedicineCatalog(prisma: any) {
    const drugs = await prisma.drugMaster.findMany({
      select: { id: true, name: true, genericName: true, strength: true, formulation: true },
    });
    for (const drug of drugs) {
      await this.searchService.index({
        entityType: 'medicine',
        entityId: drug.id,
        title: drug.name,
        content: `${drug.genericName || ''} ${drug.strength || ''} ${drug.formulation || ''}`.trim(),
        metadata: {
          genericName: drug.genericName,
          strength: drug.strength,
          formulation: drug.formulation,
        },
      });
    }
  }

  private async seedInvestigationCatalog(prisma: any) {
    const investigations = await prisma.investigationMaster.findMany({
      select: { id: true, testName: true, testCode: true, sampleType: true, fastingRequired: true },
    });
    for (const test of investigations) {
      await this.searchService.index({
        entityType: 'investigation',
        entityId: test.id,
        title: test.testName,
        content: `${test.testCode || ''} ${test.sampleType || ''}`.trim(),
        metadata: {
          testCode: test.testCode,
          sampleType: test.sampleType,
          fastingRequired: test.fastingRequired,
        },
      });
    }
  }

  private async seedPatients(prisma: any) {
    const patients = await prisma.patient.findMany();
    for (const p of patients) {
      await this.searchService.index({
        entityType: 'patient',
        entityId: p.id,
        title: p.name.trim(),
        content: `Phone: ${p.phone} Gender: ${p.gender || ''}`,
        metadata: p as any,
      });
    }
  }

  private async seedDoctors(prisma: any) {
    const doctors = await prisma.doctorMaster.findMany();
    for (const d of doctors) {
      await this.searchService.index({
        entityType: 'doctor',
        entityId: d.id,
        title: d.fullName.trim(),
        content: `Email: ${d.email} Mobile: ${d.mobile}`,
        metadata: d as any,
      });
    }
  }

  private async seedAppointments(prisma: any) {
    const appointments = await prisma.appointment.findMany();
    for (const a of appointments) {
      await this.searchService.index({
        entityType: 'appointment',
        entityId: a.id,
        hospitalId: a.hospitalId || undefined,
        title: `Appointment ${a.id}`,
        content: `Date: ${a.date} Slot: ${a.slot} Status: ${a.status}`,
        metadata: a as any,
      });
    }
  }

  private async seedTimelineEvents(prisma: any) {
    const events = await prisma.timelineEvent.findMany();
    for (const e of events) {
      await this.searchService.index({
        entityType: 'timeline',
        entityId: e.id,
        hospitalId: e.hospitalId || undefined,
        title: e.title,
        content: e.description || e.summary || JSON.stringify(e.metadata),
        metadata: e as any,
      });
    }
  }

  private async seedInvoices(prisma: any) {
    const invoices = await prisma.invoice.findMany({ include: { patient: true } });
    for (const i of invoices) {
      await this.searchService.index({
        entityType: 'bill',
        entityId: i.id,
        hospitalId: i.hospitalId || undefined,
        title: `Invoice ${i.invoiceNumber}`,
        content: `Total: ${i.totalAmount} Status: ${i.status} Patient: ${i.patient?.name || ''}`,
        metadata: i as any,
      });
    }
  }

  private async seedLabOrders(prisma: any) {
    const labOrders = await prisma.labOrder.findMany({ include: { patient: true } });
    for (const l of labOrders) {
      await this.searchService.index({
        entityType: 'lab',
        entityId: l.id,
        hospitalId: l.hospitalId || undefined,
        title: `Lab Order ${l.orderNumber}`,
        content: `Status: ${l.status} Priority: ${l.priority} Patient: ${l.patient?.name || ''}`,
        metadata: l as any,
      });
    }
  }

  private async seedPrescriptions(prisma: any) {
    const prescriptions = await prisma.patientPrescription.findMany({ include: { patient: true } });
    for (const p of prescriptions) {
      await this.searchService.index({
        entityType: 'prescription',
        entityId: p.id,
        title: `Prescription for ${p.patient?.name || 'Patient'}`,
        content: `Type: ${p.type} Notes: ${p.notes || ''}`,
        metadata: p as any,
      });
    }
  }
}
