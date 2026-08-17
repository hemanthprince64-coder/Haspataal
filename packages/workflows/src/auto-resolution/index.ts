/**
 * Strict Execution Policy for Auto-Resolution Workflows.
 * Explicitly categorizes what can be autonomous, what needs human approval, and what is never autonomous.
 */

export enum AutonomyLevel {
  AUTONOMOUS = 'AUTONOMOUS', // Always Safe
  HUMAN_APPROVAL = 'HUMAN_APPROVAL', // Requires explicit human approval via the Approval Platform
  NEVER_AUTONOMOUS = 'NEVER_AUTONOMOUS', // Prohibited from automation completely
}

export const WorkflowExecutionPolicy: Record<string, AutonomyLevel> = {
  // AUTONOMOUS (Always Safe)
  RETRY_FAILED_WEBHOOK: AutonomyLevel.AUTONOMOUS,
  RESTART_WORKER: AutonomyLevel.AUTONOMOUS,
  CLEAR_CACHE: AutonomyLevel.AUTONOMOUS,
  REQUEUE_JOB: AutonomyLevel.AUTONOMOUS,
  AUTO_ROUTE_SUPPORT_TICKET: AutonomyLevel.AUTONOMOUS,
  REFRESH_MATERIALIZED_VIEW: AutonomyLevel.AUTONOMOUS,

  // HUMAN APPROVAL REQUIRED
  SCALE_INFRASTRUCTURE: AutonomyLevel.HUMAN_APPROVAL,
  CHANGE_BILLING: AutonomyLevel.HUMAN_APPROVAL,
  MODIFY_HOSPITAL_CONFIG: AutonomyLevel.HUMAN_APPROVAL,
  ENABLE_PREMIUM_CAPABILITY: AutonomyLevel.HUMAN_APPROVAL,
  SUSPEND_INTEGRATION: AutonomyLevel.HUMAN_APPROVAL,
  STAFFING_EXPANSION: AutonomyLevel.HUMAN_APPROVAL,

  // NEVER AUTONOMOUS
  MODIFY_EMR: AutonomyLevel.NEVER_AUTONOMOUS,
  DELETE_CLINICAL_DATA: AutonomyLevel.NEVER_AUTONOMOUS,
  PRESCRIBE_MEDICATION: AutonomyLevel.NEVER_AUTONOMOUS,
  CHANGE_PATIENT_RECORDS: AutonomyLevel.NEVER_AUTONOMOUS,
  FINANCIAL_WRITE_OFFS: AutonomyLevel.NEVER_AUTONOMOUS,
};

export class ExecutionPolicyValidator {
  /**
   * Ensures that a requested workflow action complies with platform governance.
   */
  static validate(workflowAction: string) {
    const level = WorkflowExecutionPolicy[workflowAction];

    if (level === AutonomyLevel.NEVER_AUTONOMOUS) {
      throw new Error(
        `[Execution Policy] Action ${workflowAction} is explicitly prohibited from autonomous execution.`,
      );
    }

    return level;
  }
}
