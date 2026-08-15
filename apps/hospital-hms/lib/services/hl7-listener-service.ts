/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@haspataal/db';
import { v4 as uuidv4 } from 'uuid';


// -----------------------------------------------------------------------------
// HL7 / FHIR INTEGRATION & EVENT PUBLISHING BLUEPRINT
// -----------------------------------------------------------------------------
// This service simulates the ingestion of an HL7 ORU_R01 (Observation Result)
// message from a laboratory analyzer, translating it into our domain model,
// and publishing a domain event (`LabResultVerified`) to the Event Bus.
//
// This decouples the LIS from the EMR, Billing, and Notification systems.
// -----------------------------------------------------------------------------

export class HL7ListenerService {
  /**
   * Mocks the ingestion of an HL7 ORU message from a physical analyzer.
   */
  async processHL7Result(hl7Payload: string, hospitalId: string) {
    console.log({ hospitalId }, 'Received HL7 ORU message from Analyzer');

    // In a real implementation, we would parse the HL7 string (e.g. using node-hl7-parser)
    // For this blueprint, we simulate extracting the Accession ID and Result values.
    const accessionId = this.extractAccessionId(hl7Payload);
    const results = this.extractResults(hl7Payload);
    const isCritical = this.evaluateCriticalThresholds(results);

    // 1. Transactionally update the execution state and log the event
    await prisma.$transaction(async (tx) => {
      // Find the pending execution item
      const execItem = await tx.laboratoryExecutionItem.findFirst({
        where: { id: accessionId, status: 'IN_ANALYZER_QUEUE' },
        include: { execution: true },
      });

      if (!execItem) {
        throw new Error(`Accession ${accessionId} not found or not in Analyzer Queue`);
      }

      // Create the result record
      const resultRecord = await tx.laboratoryResult.create({
        data: {
          executionItemId: execItem.id,
          hospitalId,
          patientId: execItem.execution.patientId,
          status: 'DRAFT',
        },
      });

      // Update the state machine to VERIFIED
      await tx.laboratoryExecutionItem.update({
        where: { id: execItem.id },
        data: {
          status: 'RESULT_VERIFIED',
          resultId: resultRecord.id,
        },
      });

      // 2. Publish Domain Event to EventLog (Single Source of Truth)
      const eventId = uuidv4();
      await tx.eventLog.create({
        data: {
          id: eventId,
          hospitalId,
          eventType: 'LAB_RESULT_VERIFIED',
          payload: {
            accessionId,
            resultId: resultRecord.id,
            isCritical,
          } as any,
        },
      });

      console.log({ eventId, accessionId }, 'Published LAB_RESULT_VERIFIED domain event');
    });

    return { success: true };
  }

  // --- Mock Parsers ---
  private extractAccessionId(payload: string): string {
    return 'LAB-2003'; // Mocked extraction from OBR segment
  }

  private extractResults(payload: string): any[] {
    return [{ test: 'Troponin I', value: 1.45, unit: 'ng/mL' }]; // Mocked extraction from OBX segment
  }

  private evaluateCriticalThresholds(results: any[]): boolean {
    return true; // Mocked evaluation against CriticalValueRule table
  }
}

export const hl7ListenerService = new HL7ListenerService();
