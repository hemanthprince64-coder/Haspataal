export enum AiRiskLevel {
  AUTONOMOUS = 1,
  HUMAN_APPROVAL = 2,
  NEVER_AUTONOMOUS = 3,
}

export type AiExecutionMode = 'AUTONOMOUS' | 'HUMAN_APPROVAL' | 'RECOMMENDATION';

export interface PolicyEvaluationResult {
  isAllowed: boolean;
  requiredRiskLevel: AiRiskLevel;
  executionMode: AiExecutionMode;
  policyId?: string;
  reason?: string;
}

export interface AiActionContext {
  actionType: string;
  tenantId?: string;
  region?: string;
  payload: Record<string, any>;
}
