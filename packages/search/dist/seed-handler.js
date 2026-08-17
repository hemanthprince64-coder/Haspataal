import { createPlatformCommandSchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
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
    constructor(searchService) {
        this.searchService = searchService;
    }
    async handleSeedCommand(rawCommand) {
        const command = SeedCommandSchema.parse(rawCommand);
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
                entityId: drugId,
                title: drugName,
                content: `${genericName || ''} ${strength || ''} ${formulation || ''}`.trim(),
                metadata: { genericName, strength, formulation },
            });
            return { success: true };
        }
        if (action === 'index-investigation') {
            const { testId, testName, testCode, sampleType, fastingRequired } = command.payload;
            await this.searchService.index({
                entityType: 'investigation',
                entityId: testId,
                title: testName,
                content: `${testCode || ''} ${sampleType || ''}`.trim(),
                metadata: { testCode, sampleType, fastingRequired },
            });
            return { success: true };
        }
        throw new Error('Unknown action');
    }
    async seedMedicineCatalog(prisma) {
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
    async seedInvestigationCatalog(prisma) {
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
    async seedPatients(prisma) {
        const patients = await prisma.patient.findMany();
        for (const p of patients) {
            await this.searchService.index({
                entityType: 'patient',
                entityId: p.id,
                title: p.name.trim(),
                content: `Phone: ${p.phone} Gender: ${p.gender || ''}`,
                metadata: p,
            });
        }
    }
    async seedDoctors(prisma) {
        const doctors = await prisma.doctorMaster.findMany();
        for (const d of doctors) {
            await this.searchService.index({
                entityType: 'doctor',
                entityId: d.id,
                title: d.fullName.trim(),
                content: `Email: ${d.email} Mobile: ${d.mobile}`,
                metadata: d,
            });
        }
    }
    async seedAppointments(prisma) {
        const appointments = await prisma.appointment.findMany();
        for (const a of appointments) {
            await this.searchService.index({
                entityType: 'appointment',
                entityId: a.id,
                hospitalId: a.hospitalId || undefined,
                title: `Appointment ${a.id}`,
                content: `Date: ${a.date} Slot: ${a.slot} Status: ${a.status}`,
                metadata: a,
            });
        }
    }
    async seedTimelineEvents(prisma) {
        const events = await prisma.timelineEvent.findMany();
        for (const e of events) {
            await this.searchService.index({
                entityType: 'timeline',
                entityId: e.id,
                hospitalId: e.hospitalId || undefined,
                title: e.title,
                content: e.description || e.summary || JSON.stringify(e.metadata),
                metadata: e,
            });
        }
    }
    async seedInvoices(prisma) {
        var _a;
        const invoices = await prisma.invoice.findMany({ include: { patient: true } });
        for (const i of invoices) {
            await this.searchService.index({
                entityType: 'bill',
                entityId: i.id,
                hospitalId: i.hospitalId || undefined,
                title: `Invoice ${i.invoiceNumber}`,
                content: `Total: ${i.totalAmount} Status: ${i.status} Patient: ${((_a = i.patient) === null || _a === void 0 ? void 0 : _a.name) || ''}`,
                metadata: i,
            });
        }
    }
    async seedLabOrders(prisma) {
        var _a;
        const labOrders = await prisma.labOrder.findMany({ include: { patient: true } });
        for (const l of labOrders) {
            await this.searchService.index({
                entityType: 'lab',
                entityId: l.id,
                hospitalId: l.hospitalId || undefined,
                title: `Lab Order ${l.orderNumber}`,
                content: `Status: ${l.status} Priority: ${l.priority} Patient: ${((_a = l.patient) === null || _a === void 0 ? void 0 : _a.name) || ''}`,
                metadata: l,
            });
        }
    }
    async seedPrescriptions(prisma) {
        var _a;
        const prescriptions = await prisma.patientPrescription.findMany({ include: { patient: true } });
        for (const p of prescriptions) {
            await this.searchService.index({
                entityType: 'prescription',
                entityId: p.id,
                title: `Prescription for ${((_a = p.patient) === null || _a === void 0 ? void 0 : _a.name) || 'Patient'}`,
                content: `Type: ${p.type} Notes: ${p.notes || ''}`,
                metadata: p,
            });
        }
    }
}
