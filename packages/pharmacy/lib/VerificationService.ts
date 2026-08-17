import { PrismaClient, PharmacyExecutionStatus } from '@haspataal/db';

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

      // Emit outbox event
      await tx.outboxEvent.create({
        data: {
          eventType: 'PHARMACY_VERIFIED',
          payload: {
            executionId,
            verifiedBy,
          },
          aggregateType: 'PHARMACY_EXECUTION',
          aggregateId: executionId,
          hospitalId: execution.hospitalId,
          actorId: verifiedBy,
        },
      });
    });
  }

  /**
   * Substitutes an item in a pharmacy execution prior to verification.
   */
  async substituteItem(
    executionId: string,
    executionItemId: string,
    substitutedCatalogVersionId: string,
    approvedBy: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.pharmacyExecution.findUnique({
        where: { id: executionId },
      });

      if (!execution || execution.status !== PharmacyExecutionStatus.PENDING_VERIFICATION) {
        throw new Error('Can only substitute items in PENDING_VERIFICATION state');
      }

      // Record the substitution audit log
      await tx.pharmacySubstitution.create({
        data: {
          executionItemId,
          substitutedCatalogVersionId,
          approvedBy,
          reason,
        },
      });

      // No actual mutation to the canonical OrderItem occurs here.
      // The pharmacy execution engine now knows that this item is being fulfilled
      // with a different catalog version (which would be used by InventoryService to find the right batch).
      // Since our schema maps inventory to catalogVersionId at the OrderItem level,
      // we would need the inventory service to be aware of substitutions.
    });
  }
}
