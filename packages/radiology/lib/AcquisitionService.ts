import { PrismaClient } from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import { AcquireImageInput, RadiologyEventName } from './types';

export class AcquisitionService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async acquireImages(input: AcquireImageInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Concurrency control on execution item
      await tx.$executeRaw`SELECT id FROM radiology_execution_items WHERE id = ${input.executionItemId} FOR UPDATE`;

      const executionItem = await tx.radiologyExecutionItem.findUnique({
        where: { id: input.executionItemId },
        include: { execution: true },
      });

      if (!executionItem) throw new Error('Execution item not found');

      const execution = executionItem.execution;

      if (['REPORTING', 'REPORT_VERIFIED', 'RELEASED', 'CANCELLED'].includes(execution.status)) {
        throw new Error(`Cannot acquire images in state ${execution.status}`);
      }

      // 2. Concurrency Control on Modality to prevent double sessions if needed
      // (Mostly, StudyInstanceUID uniqueness handles DICOM dupes)

      // 3. Create AcquisitionSession
      const session = await tx.acquisitionSession.create({
        data: {
          executionId: execution.id,
          modalityId: input.modalityId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // 4. Create DICOM hierarchy
      // We rely on Prisma nested writes to insert Study -> Series -> Instances
      // The schema enforces StudyInstanceUID uniqueness. If duplicate, Prisma throws P2002.
      const study = await tx.imagingStudy.create({
        data: {
          studyInstanceUID: input.studyInstanceUID,
          accessionNumber: input.accessionNumber,
          sessionId: session.id,
          series: {
            create: input.series.map((s) => ({
              seriesInstanceUID: s.seriesInstanceUID,
              seriesNumber: s.seriesNumber,
              modality: s.modality as any, // Cast to ModalityType
              instances: {
                create: s.instances.map((i) => ({
                  sopInstanceUID: i.sopInstanceUID,
                  instanceNumber: i.instanceNumber,
                  storageUri: i.storageUri,
                  mimeType: i.mimeType,
                })),
              },
            })),
          },
        },
      });

      // 5. Create Contrast Administration if provided
      if (input.contrast) {
        // Upsert contrast in case of retry or multiple sessions?
        // executionItemId is @unique in contrastAdministration, so we do upsert or create
        await tx.contrastAdministration.upsert({
          where: { executionItemId: executionItem.id },
          create: {
            executionItemId: executionItem.id,
            contrastType: input.contrast.contrastType as any,
            agentName: input.contrast.agentName,
            lotNumber: input.contrast.lotNumber,
            dose: input.contrast.dose,
            unit: input.contrast.unit,
            route: input.contrast.route,
            startedAt: new Date(),
            completedAt: new Date(),
            reactionObserved: input.contrast.reactionObserved,
            reactionSeverity: input.contrast.reactionSeverity,
          },
          update: {
            // In real world, we might append or replace depending on policy
            // Here we update if retried
            dose: input.contrast.dose,
          },
        });

        await this.outbox.createEvent(
          tx,
          execution.patientId,
          RadiologyEventName.CONTRAST_ADMINISTERED,
          {
            executionId: execution.id,
            executionItemId: executionItem.id,
            contrast: input.contrast,
          },
        );
      }

      // 6. Update Execution states
      await tx.radiologyExecution.update({
        where: { id: execution.id },
        data: { status: 'ACQUIRED' },
      });

      await tx.radiologyExecutionItem.update({
        where: { id: executionItem.id },
        data: { status: 'ACQUIRED' },
      });

      // 7. Emit outbox event
      await this.outbox.createEvent(tx, execution.patientId, RadiologyEventName.IMAGE_ACQUIRED, {
        executionId: execution.id,
        executionItemId: executionItem.id,
        sessionId: session.id,
        studyId: study.id,
        studyInstanceUID: study.studyInstanceUID,
      });
    });
  }
}
