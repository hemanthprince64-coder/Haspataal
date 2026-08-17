import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

export class GenerateEncounterSummaryUseCase {
  static async execute(encounterId: string, actorId: string) {
    logger.info(`Generating summary for encounter ${encounterId}`);

    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        PatientPrescription: { include: { items: true } },
        VisitNote: true,
        VitalRecord: true,
        orders: true,
      },
    });

    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    const diagnoses = encounter.VisitNote.filter((n) => n.type === 'DIAGNOSIS');
    const prescriptions = encounter.PatientPrescription;
    const orders = encounter.orders;
    const vitals = encounter.VitalRecord;

    const summaryJson = {
      diagnoses: diagnoses.map((d) => d.content),
      prescriptions: prescriptions.flatMap((p) =>
        p.items.map((i) => `${i.medicineName} - ${i.dosage} for ${i.duration}`),
      ),
      orders: orders.map((o) => `${o.type} (${o.priority})`),
      vitals: vitals.length > 0 ? vitals[vitals.length - 1] : null,
    };

    let summaryMarkdown = `## Encounter Summary\n\n`;

    if (summaryJson.diagnoses.length > 0) {
      summaryMarkdown += `### Diagnoses\n`;
      summaryJson.diagnoses.forEach((d) => {
        summaryMarkdown += `- ${d}\n`;
      });
      summaryMarkdown += `\n`;
    }

    if (summaryJson.prescriptions.length > 0) {
      summaryMarkdown += `### Prescriptions\n`;
      summaryJson.prescriptions.forEach((p) => {
        summaryMarkdown += `- ${p}\n`;
      });
      summaryMarkdown += `\n`;
    }

    if (summaryJson.orders.length > 0) {
      summaryMarkdown += `### Orders\n`;
      summaryJson.orders.forEach((o) => {
        summaryMarkdown += `- ${o}\n`;
      });
      summaryMarkdown += `\n`;
    }

    if (summaryJson.vitals) {
      const v = summaryJson.vitals as any;
      summaryMarkdown += `### Vitals\n`;
      if (v.temperature) summaryMarkdown += `- Temp: ${v.temperature}°F\n`;
      if (v.pulse) summaryMarkdown += `- Pulse: ${v.pulse} bpm\n`;
      if (v.bloodPressure) summaryMarkdown += `- BP: ${v.bloodPressure}\n`;
      if (v.spo2) summaryMarkdown += `- SpO2: ${v.spo2}%\n`;
      summaryMarkdown += `\n`;
    }

    if (summaryMarkdown === `## Encounter Summary\n\n`) {
      summaryMarkdown += `No clinical activities recorded for this encounter.\n`;
    }

    // Upsert EncounterSummary
    const summary = await prisma.encounterSummary.upsert({
      where: { encounterId },
      update: {
        summaryMarkdown,
        summaryJson,
        generatedAt: new Date(),
        generatedBy: actorId,
        version: { increment: 1 },
      },
      create: {
        encounterId,
        summaryMarkdown,
        summaryJson,
        generatedAt: new Date(),
        generatedBy: actorId,
      },
    });

    return summary;
  }
}
