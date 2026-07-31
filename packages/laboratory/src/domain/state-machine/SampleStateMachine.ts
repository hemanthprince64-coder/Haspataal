import { SampleStatus } from '@haspataal/db';

export class SampleStateMachine {
  private static VALID_TRANSITIONS: Record<SampleStatus, SampleStatus[]> = {
    [SampleStatus.COLLECTION_PENDING]: [SampleStatus.COLLECTED, SampleStatus.REJECTED],
    [SampleStatus.COLLECTED]: [SampleStatus.ACCESSIONED, SampleStatus.REJECTED],
    [SampleStatus.ACCESSIONED]: [SampleStatus.PROCESSING, SampleStatus.REJECTED],
    [SampleStatus.PROCESSING]: [SampleStatus.COMPLETED, SampleStatus.REJECTED],
    [SampleStatus.COMPLETED]: [],
    [SampleStatus.REJECTED]: [SampleStatus.COLLECTION_PENDING], // Allow re-collection
  };

  /**
   * Evaluates whether a transition from currentState to nextState is valid.
   */
  public static canTransition(currentState: SampleStatus, nextState: SampleStatus): boolean {
    if (currentState === nextState) return true; // Idempotent updates allowed
    const validNextStates = this.VALID_TRANSITIONS[currentState] || [];
    return validNextStates.includes(nextState);
  }

  /**
   * Validates a transition and throws an error if it is invalid.
   */
  public static validateTransition(currentState: SampleStatus, nextState: SampleStatus): void {
    if (!this.canTransition(currentState, nextState)) {
      throw new Error(`Invalid sample status transition from ${currentState} to ${nextState}`);
    }
  }
}
