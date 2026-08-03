import { BaseStateMachine } from '@haspataal/core';

export type PharmacyState =
  | 'PRESCRIBED'
  | 'VERIFIED'
  | 'PARTIALLY_DISPENSED'
  | 'DISPENSED'
  | 'CANCELLED';

export class PharmacyStateMachine extends BaseStateMachine<PharmacyState> {
  protected transitions: Record<PharmacyState, PharmacyState[]> = {
    PRESCRIBED: ['VERIFIED', 'CANCELLED'],
    VERIFIED: ['PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED'],
    PARTIALLY_DISPENSED: ['DISPENSED', 'CANCELLED'],
    DISPENSED: [],
    CANCELLED: [],
  };

  private static instance = new PharmacyStateMachine();

  public static canTransition(from: PharmacyState, to: PharmacyState): boolean {
    return PharmacyStateMachine.instance.canTransition(from, to);
  }

  public static validateTransition(from: PharmacyState, to: PharmacyState): void {
    PharmacyStateMachine.instance.validateTransition(from, to);
  }
}
