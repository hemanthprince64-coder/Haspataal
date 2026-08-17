import { BaseStateMachine } from '@haspataal/core';

export type PharmacyState =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'STOCK_RESERVED'
  | 'PARTIALLY_DISPENSED'
  | 'FULLY_DISPENSED'
  | 'COMPLETED'
  | 'CANCELLED';

export class PharmacyStateMachine extends BaseStateMachine<PharmacyState> {
  protected transitions: Record<PharmacyState, PharmacyState[]> = {
    PENDING_VERIFICATION: ['VERIFIED', 'CANCELLED'],
    VERIFIED: ['STOCK_RESERVED', 'PARTIALLY_DISPENSED', 'FULLY_DISPENSED', 'CANCELLED'],
    STOCK_RESERVED: ['PARTIALLY_DISPENSED', 'FULLY_DISPENSED', 'CANCELLED'],
    PARTIALLY_DISPENSED: ['FULLY_DISPENSED', 'CANCELLED'],
    FULLY_DISPENSED: ['COMPLETED'],
    COMPLETED: [],
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
