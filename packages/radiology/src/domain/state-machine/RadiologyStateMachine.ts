import { BaseStateMachine } from '@haspataal/core';

export type RadiologyState =
  | 'ORDERED'
  | 'SCHEDULED'
  | 'ACCESSIONED'
  | 'IMAGE_ACQUIRED'
  | 'REPORT_DRAFTED'
  | 'REPORT_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED';

export class RadiologyStateMachine extends BaseStateMachine<RadiologyState> {
  protected transitions: Record<RadiologyState, RadiologyState[]> = {
    ORDERED: ['SCHEDULED', 'ACCESSIONED', 'CANCELLED'],
    SCHEDULED: ['ACCESSIONED', 'CANCELLED'],
    ACCESSIONED: ['IMAGE_ACQUIRED', 'CANCELLED'],
    IMAGE_ACQUIRED: ['REPORT_DRAFTED', 'CANCELLED'],
    REPORT_DRAFTED: ['REPORT_VERIFIED'],
    REPORT_VERIFIED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  private static instance = new RadiologyStateMachine();

  public static canTransition(from: RadiologyState, to: RadiologyState): boolean {
    return RadiologyStateMachine.instance.canTransition(from, to);
  }

  public static validateTransition(from: RadiologyState, to: RadiologyState): void {
    RadiologyStateMachine.instance.validateTransition(from, to);
  }
}
