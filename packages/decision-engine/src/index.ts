import db from '@haspataal/db';

export class DecisionEngine {
  /**
   * Processes a prediction to determine if a governed action should be taken.
   * Pipeline: Prediction -> Rule Evaluator -> Policy Evaluator -> Execution Planner
   */
  static async processPrediction(insightId: string) {
    const insight = await db.predictionInsight.findUnique({
      where: { id: insightId },
    });

    if (!insight) throw new Error('Insight not found');

    // 1. Rule Evaluator (Match prediction against rules)
    const matchingRules = await db.decisionRule.findMany({
      where: { enabled: true }, // In reality, filter based on condition JSON
    });

    if (matchingRules.length === 0) return null;
    const rule = matchingRules[0]; // Simplified: take highest priority
    if (!rule) return null;

    // 2. Policy Evaluator (Would invoke ai-policy here)
    // 3. Impact Analyzer (Would check side-effects)

    // 4. Execution Planner
    const plan = await db.decisionExecutionPlan.create({
      data: {
        predictionId: insightId,
        ruleId: rule.id,
        proposedAction: { type: rule.actionType, target: insight.entityId },
        status: 'PENDING_APPROVAL',
      },
    });

    return plan;
  }
}
