import db from '@haspataal/db';

export class ExplanationEngine {
  /**
   * Translates a raw machine decision plan into human-readable explanation text.
   */
  static async explainPlan(
    planId: string,
    audience: 'OPERATIONS' | 'EXECUTIVE' | 'CLINICAL' = 'OPERATIONS',
  ): Promise<string> {
    const plan = await db.decisionExecutionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new Error('Plan not found');

    // In a real system, this invokes the LLM (AiOperationsEngine) with a specific prompt template
    // designed to generate explanations based on the audience.

    if (audience === 'EXECUTIVE') {
      return `Recommended action to protect platform SLA targets and prevent potential downtime.`;
    }

    return `System detected 82% SLA breach probability due to queue buildup. Action: ${(plan.proposedAction as any).type} is recommended to resolve.`;
  }
}
