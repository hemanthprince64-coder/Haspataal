import { LabResultStatus } from '@haspataal/db';

export class ResultStateMachine {
  private static VALID_TRANSITIONS: Record<LabResultStatus, LabResultStatus[]> = {
    [LabResultStatus.DRAFT]: [LabResultStatus.UNDER_REVIEW, LabResultStatus.VERIFIED],
    [LabResultStatus.UNDER_REVIEW]: [LabResultStatus.DRAFT, LabResultStatus.VERIFIED],
    [LabResultStatus.VERIFIED]: [LabResultStatus.AMENDED],
    [LabResultStatus.AMENDED]: [LabResultStatus.DRAFT, LabResultStatus.VERIFIED],
  };

  /**
   * Evaluates whether a transition from currentState to nextState is valid.
   */
  public static canTransition(currentState: LabResultStatus, nextState: LabResultStatus): boolean {
    if (currentState === nextState) return true; // Idempotent updates allowed
    const validNextStates = this.VALID_TRANSITIONS[currentState] || [];
    return validNextStates.includes(nextState);
  }

  /**
   * Validates a transition and throws an error if it is invalid.
   */
  public static validateTransition(
    currentState: LabResultStatus,
    nextState: LabResultStatus,
  ): void {
    if (!this.canTransition(currentState, nextState)) {
      throw new Error(`Invalid lab result status transition from ${currentState} to ${nextState}`);
    }
  }
}
