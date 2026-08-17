import db from '@haspataal/db';

export class ApprovalEngine {
  /**
   * Initializes a universal approval request based on a policy.
   */
  static async createRequest(policyId: string, targetType: string, targetId: string) {
    const policy = await db.approvalPolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) throw new Error('Policy not found');

    const request = await db.approvalRequest.create({
      data: {
        policyId,
        targetType,
        targetId,
        status: 'PENDING',
      },
    });

    // Create steps based on requiredRoles and strategy
    // In SEQUENTIAL strategy, orderIndex matters. In ALL/ANY, orderIndex can be same.
    for (const [index, role] of policy.requiredRoles.entries()) {
      await db.approvalStep.create({
        data: {
          requestId: request.id,
          requiredRole: role,
          orderIndex: policy.approvalStrategy === 'SEQUENTIAL' ? index : 0,
        },
      });
    }

    return request;
  }

  /**
   * Submits a response to an approval step and evaluates if the request is fully approved.
   */
  static async submitResponse(
    stepId: string,
    userId: string,
    decision: 'APPROVED' | 'REJECTED',
    comments?: string,
  ) {
    await db.approvalResponse.create({
      data: {
        stepId,
        userId,
        decision,
        comments,
      },
    });

    const step = await db.approvalStep.update({
      where: { id: stepId },
      data: { status: decision },
      include: { request: true },
    });

    await this.evaluateRequestStatus(step.request.id);
  }

  private static async evaluateRequestStatus(requestId: string) {
    // 1. Fetch policy and all steps
    // 2. Evaluate based on policy.approvalStrategy (ALL, ANY, MAJORITY)
    // 3. Update request status to APPROVED or REJECTED
    // 4. If APPROVED, emit ApprovalGranted event (caught by Orchestration layer)
  }
}
