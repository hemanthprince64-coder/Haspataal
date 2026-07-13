import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class ResultService {
  constructor(private prisma: PrismaClient) {}
  async enter(
    hospitalId: string,
    patientId: string,
    executionItemId: string,
    values: any,
    referenceRanges?: any,
    abnormalFlags?: any,
    units?: any,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Find or create LaboratoryResult
      let result = await tx.laboratoryResult.findUnique({
        where: { executionItemId },
      });

      if (!result) {
        result = await tx.laboratoryResult.create({
          data: {
            executionItemId,
            hospitalId,
            patientId,
            status: 'DRAFT',
          },
        });
      }

      // Find current max version
      const latestVersion = await tx.laboratoryResultVersion.findFirst({
        where: { resultId: result.id },
        orderBy: { versionNumber: 'desc' },
      });

      const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      const version = await tx.laboratoryResultVersion.create({
        data: {
          resultId: result.id,
          versionNumber: nextVersionNumber,
          values: JSON.parse(JSON.stringify(values)),
          referenceRanges: referenceRanges ? JSON.parse(JSON.stringify(referenceRanges)) : null,
          abnormalFlags: abnormalFlags ? JSON.parse(JSON.stringify(abnormalFlags)) : null,
          units: units ? JSON.parse(JSON.stringify(units)) : null,
        },
      });

      result = await tx.laboratoryResult.update({
        where: { id: result.id },
        data: {
          status: 'DRAFT',
          activeVersionId: version.id,
        },
      });

      const item = await tx.laboratoryExecutionItem.update({
        where: { id: executionItemId },
        data: {
          resultId: result.id,
          status: 'RESULT_ENTERED',
        },
      });

      await tx.outboxEvent.create({
        data: {
          id: uuidv4(),
          aggregateType: 'LaboratoryExecution',
          aggregateId: item.executionId,
          eventType: 'RESULT_ENTERED',
          payload: JSON.parse(
            JSON.stringify({
              executionItemId,
              resultId: result.id,
              versionId: version.id,
            }),
          ),
        },
      });

      return { result, version };
    });
  }

  async verify(executionItemId: string, verifiedBy: string) {
    return await this.prisma.$transaction(async (tx) => {
      // FOR UPDATE lock to prevent concurrent verifications
      await tx.$executeRaw`SELECT id FROM laboratory_results WHERE execution_item_id = ${executionItemId} FOR UPDATE`;

      const result = await tx.laboratoryResult.findUniqueOrThrow({
        where: { executionItemId },
        include: { executionItems: true },
      });

      if (!result.activeVersionId) throw new Error('No active result version to verify');

      if (result.status === 'VERIFIED' || result.status === 'RELEASED') {
        // Idempotent or already verified
        return result;
      }

      await tx.laboratoryResultVersion.update({
        where: { id: result.activeVersionId },
        data: {
          verifiedAt: new Date(),
          verifiedBy,
        },
      });

      const updatedResult = await tx.laboratoryResult.update({
        where: { id: result.id },
        data: { status: 'VERIFIED' },
      });

      const item = await tx.laboratoryExecutionItem.update({
        where: { id: executionItemId },
        data: { status: 'RESULT_VERIFIED' },
      });

      await tx.outboxEvent.create({
        data: {
          id: uuidv4(),
          aggregateType: 'LaboratoryExecution',
          aggregateId: item.executionId,
          eventType: 'RESULT_VERIFIED',
          payload: JSON.parse(
            JSON.stringify({
              executionItemId,
              resultId: result.id,
              verifiedBy,
            }),
          ),
        },
      });

      return updatedResult;
    });
  }

  async release(executionItemId: string, releasedBy: string) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM laboratory_results WHERE execution_item_id = ${executionItemId} FOR UPDATE`;

      const result = await tx.laboratoryResult.findUniqueOrThrow({
        where: { executionItemId },
      });

      if (!result.activeVersionId) throw new Error('No active result version to release');
      if (result.status !== 'VERIFIED' && result.status !== 'AMENDED') {
        throw new Error('Result must be VERIFIED before releasing');
      }

      await tx.laboratoryResultVersion.update({
        where: { id: result.activeVersionId },
        data: {
          releasedAt: new Date(),
          releasedBy,
        },
      });

      const updatedResult = await tx.laboratoryResult.update({
        where: { id: result.id },
        data: { status: 'RELEASED' },
      });

      const item = await tx.laboratoryExecutionItem.update({
        where: { id: executionItemId },
        data: { status: 'RELEASED' },
      });

      // Update parent status if all items are released
      const allItems = await tx.laboratoryExecutionItem.findMany({
        where: { executionId: item.executionId },
      });
      const allReleased = allItems.every((i) => i.status === 'RELEASED');
      if (allReleased) {
        await tx.laboratoryExecution.update({
          where: { id: item.executionId },
          data: { status: 'RELEASED' },
        });
      }

      await tx.outboxEvent.create({
        data: {
          id: uuidv4(),
          aggregateType: 'LaboratoryExecution',
          aggregateId: item.executionId,
          eventType: 'RESULT_RELEASED',
          payload: JSON.parse(
            JSON.stringify({
              executionItemId,
              resultId: result.id,
              releasedBy,
            }),
          ),
        },
      });

      return updatedResult;
    });
  }

  async amend(
    executionItemId: string,
    amendedBy: string,
    values: any,
    referenceRanges?: any,
    abnormalFlags?: any,
    units?: any,
  ) {
    // Uses similar flow to enter() but sets status to AMENDED
    const entry = await this.enter(
      'auto', // these are dummy since we only enter if not exists
      'auto',
      executionItemId,
      values,
      referenceRanges,
      abnormalFlags,
      units,
    );

    return await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM laboratory_results WHERE id = ${entry.result.id} FOR UPDATE`;

      const result = await tx.laboratoryResult.update({
        where: { id: entry.result.id },
        data: { status: 'AMENDED' },
      });

      // No need to change verifiedBy or releasedBy, they are null on the new draft version until verified again.

      return result;
    });
  }
}
