import { PrismaClient, PharmacyExecutionStatus } from '@prisma/client';

export class PharmacyVerificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Records a verification by a pharmacist.
   */
  async verifyExecution(
    executionId: string,
    verifiedBy: string,
    options: {
      override?: boolean;
      reason?: string;
      notes?: string;
    } = {},
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.pharmacyExecution.findUnique({
        where: { id: executionId },
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      if (execution.status !== PharmacyExecutionStatus.PENDING_VERIFICATION) {
        // Idempotency / early exit
        if (execution.status !== PharmacyExecutionStatus.CANCELLED) {
          return;
        }
        throw new Error(`Cannot verify execution in status ${execution.status}`);
      }

      // Record verification
      await tx.pharmacyVerification.create({
        data: {
          executionId,
          verifiedBy,
          override: options.override ?? false,
          reason: options.reason,
          notes: options.notes,
        },
      });

      // Update status
      await tx.pharmacyExecution.update({
        where: { id: executionId },
        data: { status: PharmacyExecutionStatus.VERIFIED },
      });
    });
  }
}
