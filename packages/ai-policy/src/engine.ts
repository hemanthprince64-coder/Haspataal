import db from '@haspataal/db';

import { AiRiskLevel, AiActionContext, PolicyEvaluationResult, AiExecutionMode } from './types';

export class PolicyEngine {
  /**
   * Evaluates an AI action against strict risk policies.
   */
  static async evaluateAction(context: AiActionContext): Promise<PolicyEvaluationResult> {
    // Look up policy by actionType
    const policy = await db.aiPolicy.findFirst({
      where: { actionType: context.actionType },
      orderBy: { createdAt: 'desc' },
    });

    if (!policy) {
      // Default to NEVER AUTONOMOUS if no policy exists for an action
      return {
        isAllowed: false,
        requiredRiskLevel: AiRiskLevel.NEVER_AUTONOMOUS,
        executionMode: 'RECOMMENDATION',
        reason: `No policy defined for actionType: ${context.actionType}`,
      };
    }

    let executionMode: AiExecutionMode = 'RECOMMENDATION';

    switch (policy.riskLevel) {
      case AiRiskLevel.AUTONOMOUS:
        executionMode = policy.requiresHuman ? 'HUMAN_APPROVAL' : 'AUTONOMOUS';
        break;
      case AiRiskLevel.HUMAN_APPROVAL:
        executionMode = 'HUMAN_APPROVAL';
        break;
      case AiRiskLevel.NEVER_AUTONOMOUS:
        executionMode = 'RECOMMENDATION';
        break;
    }

    return {
      isAllowed: true,
      requiredRiskLevel: policy.riskLevel as AiRiskLevel,
      executionMode,
      policyId: policy.id,
    };
  }
}
