import { BaseStateMachine } from '@haspataal/core';
import { LabResultStatus } from '@haspataal/db';

export class ResultStateMachine extends BaseStateMachine<LabResultStatus> {
  protected transitions: Record<LabResultStatus, LabResultStatus[]> = {
    [LabResultStatus.DRAFT]: [LabResultStatus.UNDER_REVIEW, LabResultStatus.VERIFIED],
    [LabResultStatus.UNDER_REVIEW]: [LabResultStatus.DRAFT, LabResultStatus.VERIFIED],
    [LabResultStatus.VERIFIED]: [LabResultStatus.AMENDED],
    [LabResultStatus.AMENDED]: [LabResultStatus.DRAFT, LabResultStatus.VERIFIED],
  };

  private static instance = new ResultStateMachine();

  public static canTransition(from: LabResultStatus, to: LabResultStatus): boolean {
    return ResultStateMachine.instance.canTransition(from, to);
  }

  public static validateTransition(from: LabResultStatus, to: LabResultStatus): void {
    ResultStateMachine.instance.validateTransition(from, to);
  }
}
