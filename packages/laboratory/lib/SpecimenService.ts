import { SpecimenRejectionReason } from '@haspataal/db';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class SpecimenService {
  constructor(private prisma: PrismaClient) {}
  async collect(
    hospitalId: string,
    patientId: string,
    executionItemId: string,
    specimenType: string,
    collectorId: string,
    barcode?: string,
  ) {
    const finalBarcode = barcode || `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await this.prisma.$transaction(async (tx) => {
      // Create specimen
      const specimen = await tx.specimen.create({
        data: {
          hospitalId,
          patientId,
          barcode: finalBarcode,
          specimenType,
          status: 'COLLECTED',
          collectionTime: new Date(),
          collectorId,
        },
      });

      // Update execution item
      await tx.laboratoryExecutionItem.update({
        where: { id: executionItemId },
        data: {
          specimenId: specimen.id,
          status: 'COLLECTED',
        },
      });

      // Add attempt log
      await tx.specimenCollectionAttempt.create({
        data: {
          specimenId: specimen.id,
          status: 'COLLECTED',
          attemptedById: collectorId,
        },
      });

      // Update parent execution status if necessary
      const item = await tx.laboratoryExecutionItem.findUnique({
        where: { id: executionItemId },
      });
      if (item) {
        await tx.laboratoryExecution.update({
          where: { id: item.executionId },
          data: { status: 'COLLECTED' },
        });
      }

      // We should emit a transactional outbox event
      await tx.outboxEvent.create({
        data: {
          id: uuidv4(),
          aggregateType: 'LaboratoryExecution',
          aggregateId: item?.executionId || 'unknown',
          eventType: 'SPECIMEN_COLLECTED',
          payload: JSON.parse(
            JSON.stringify({
              executionItemId,
              specimenId: specimen.id,
              barcode: specimen.barcode,
              collectorId,
            }),
          ),
        },
      });

      return specimen;
    });
  }

  async receive(specimenId: string, receivedById: string) {
    return await this.prisma.$transaction(async (tx) => {
      const specimen = await tx.specimen.update({
        where: { id: specimenId },
        data: { status: 'RECEIVED' },
        include: { executionItems: true },
      });

      await tx.specimenCollectionAttempt.create({
        data: {
          specimenId,
          status: 'RECEIVED',
          attemptedById: receivedById,
        },
      });

      for (const item of specimen.executionItems) {
        await tx.laboratoryExecutionItem.update({
          where: { id: item.id },
          data: { status: 'RECEIVED' },
        });

        await tx.outboxEvent.create({
          data: {
            id: uuidv4(),
            aggregateType: 'LaboratoryExecution',
            aggregateId: item.executionId,
            eventType: 'SPECIMEN_RECEIVED',
            payload: JSON.parse(
              JSON.stringify({
                executionItemId: item.id,
                specimenId,
                receivedById,
              }),
            ),
          },
        });
      }

      return specimen;
    });
  }

  async reject(
    specimenId: string,
    rejectedById: string,
    reason: SpecimenRejectionReason,
    notes?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const specimen = await tx.specimen.update({
        where: { id: specimenId },
        data: { status: 'REJECTED' },
        include: { executionItems: true },
      });

      await tx.specimenCollectionAttempt.create({
        data: {
          specimenId,
          status: 'REJECTED',
          attemptedById: rejectedById,
          rejectionReason: reason,
          notes,
        },
      });

      for (const item of specimen.executionItems) {
        // Unlink specimen from item so it can be recollected
        await tx.laboratoryExecutionItem.update({
          where: { id: item.id },
          data: {
            specimenId: null,
            status: 'PENDING_COLLECTION',
          },
        });

        await tx.outboxEvent.create({
          data: {
            id: uuidv4(),
            aggregateType: 'LaboratoryExecution',
            aggregateId: item.executionId,
            eventType: 'SPECIMEN_REJECTED',
            payload: JSON.parse(
              JSON.stringify({
                executionItemId: item.id,
                specimenId,
                reason,
                rejectedById,
              }),
            ),
          },
        });
      }

      return specimen;
    });
  }
}
