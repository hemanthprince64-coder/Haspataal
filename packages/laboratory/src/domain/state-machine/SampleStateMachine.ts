import { BaseStateMachine } from '@haspataal/core';
import { SampleStatus } from '@haspataal/db';

export class SampleStateMachine extends BaseStateMachine<SampleStatus> {
  protected transitions: Record<SampleStatus, SampleStatus[]> = {
    [SampleStatus.COLLECTION_PENDING]: [SampleStatus.COLLECTED, SampleStatus.REJECTED],
    [SampleStatus.COLLECTED]: [SampleStatus.ACCESSIONED, SampleStatus.REJECTED],
    [SampleStatus.ACCESSIONED]: [SampleStatus.PROCESSING, SampleStatus.REJECTED],
    [SampleStatus.PROCESSING]: [SampleStatus.COMPLETED, SampleStatus.REJECTED],
    [SampleStatus.COMPLETED]: [],
    [SampleStatus.REJECTED]: [SampleStatus.COLLECTION_PENDING], // Allow re-collection
  };

  private static instance = new SampleStateMachine();

  public static canTransition(from: SampleStatus, to: SampleStatus): boolean {
    return SampleStateMachine.instance.canTransition(from, to);
  }

  public static validateTransition(from: SampleStatus, to: SampleStatus): void {
    SampleStateMachine.instance.validateTransition(from, to);
  }
}
