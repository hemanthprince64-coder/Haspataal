import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class ResultService {
  constructor(private prisma: PrismaClient) {}

  private async evaluateRules(
    tx: any,
    hospitalId: string,
    values: Record<string, any>,
  ): Promise<string[]> {
    const flags: string[] = [];
    const rules = await tx.criticalValueRule.findMany({
      where: { hospitalId },
    });

    for (const rule of rules) {
      const val = values[rule.testCode];
      if (val === undefined || val === null) continue;
      const numVal = parseFloat(val);
      if (isNaN(numVal)) continue;

      let match = false;
      switch (rule.condition) {
        case '>':
          match = numVal > (rule.threshold ?? 0);
          break;
        case '<':
          match = numVal < (rule.threshold ?? 0);
          break;
        case '=':
          match = numVal === (rule.threshold ?? 0);
          break;
        case '>=':
          match = numVal >= (rule.threshold ?? 0);
          break;
        case '<=':
          match = numVal <= (rule.threshold ?? 0);
          break;
        case 'BETWEEN':
          match = numVal >= (rule.threshold ?? 0) && numVal <= (rule.upperThreshold ?? 0);
          break;
      }
      if (match) {
        flags.push(rule.severity);
      }
    }
    return [...new Set(flags)];
  }

  async enter(
    hospitalId: string,
    patientId: string,
    executionItemId: string,
    values: any,
    referenceRanges?: any,
    abnormalFlags?: any,
    units?: any,
    flags?: any,
    instrumentFlags?: any,
    verificationNotes?: any,
    comments?: any,
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

      // Evaluate rules for critical flags
      const derivedFlags = await this.evaluateRules(tx, hospitalId, values || {});
      const mergedFlags = Array.from(
        new Set([...(flags || []), ...(abnormalFlags || []), ...derivedFlags]),
      );

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
          values: values ? JSON.parse(JSON.stringify(values)) : {},
          referenceRanges: referenceRanges ? JSON.parse(JSON.stringify(referenceRanges)) : null,
          abnormalFlags: mergedFlags.length > 0 ? JSON.parse(JSON.stringify(mergedFlags)) : null,
          flags: mergedFlags.length > 0 ? JSON.parse(JSON.stringify(mergedFlags)) : null,
          units: units ? JSON.parse(JSON.stringify(units)) : null,
          instrumentFlags: instrumentFlags ? JSON.parse(JSON.stringify(instrumentFlags)) : null,
          verificationNotes: verificationNotes
            ? JSON.parse(JSON.stringify(verificationNotes))
            : null,
          comments: comments ? JSON.parse(JSON.stringify(comments)) : null,
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
    flags?: any,
    instrumentFlags?: any,
    verificationNotes?: any,
    comments?: any,
  ) {
    const entry = await this.enter(
      'auto',
      'auto',
      executionItemId,
      values,
      referenceRanges,
      abnormalFlags,
      units,
      flags,
      instrumentFlags,
      verificationNotes,
      comments,
    );

    return await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM laboratory_results WHERE id = ${entry.result.id} FOR UPDATE`;

      const result = await tx.laboratoryResult.update({
        where: { id: entry.result.id },
        data: { status: 'AMENDED' },
      });

      const item = await tx.laboratoryExecutionItem.findUnique({
        where: { id: executionItemId },
      });

      if (item) {
        await tx.outboxEvent.create({
          data: {
            id: uuidv4(),
            aggregateType: 'LaboratoryExecution',
            aggregateId: item.executionId,
            eventType: 'RESULT_AMENDED',
            payload: JSON.parse(
              JSON.stringify({
                executionItemId,
                resultId: result.id,
                amendedBy,
              }),
            ),
          },
        });
      }

      return result;
    });
  }
}
