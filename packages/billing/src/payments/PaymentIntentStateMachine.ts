import { PaymentIntentStatus } from '@haspataal/db';

export class InvalidStateTransitionError extends Error {
  constructor(
    public fromState: PaymentIntentStatus,
    public toState: PaymentIntentStatus,
  ) {
    super(`Invalid state transition from ${fromState} to ${toState}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class PaymentIntentStateMachine {
  /**
   * Terminal states cannot transition to any other state.
   */
  public static readonly TERMINAL_STATES: PaymentIntentStatus[] = [
    'CAPTURED',
    'FAILED',
    'CANCELLED',
    'EXPIRED',
  ];

  /**
   * Allowed state transitions for PaymentIntent.
   */
  private static readonly TRANSITIONS: Record<PaymentIntentStatus, PaymentIntentStatus[]> = {
    CREATED: ['PENDING', 'CANCELLED'],
    PENDING: ['AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'EXPIRED'],
    AUTHORIZED: ['CAPTURED', 'CANCELLED', 'EXPIRED'],
    CAPTURED: [],
    FAILED: [],
    CANCELLED: [],
    EXPIRED: [],
  };

  /**
   * Asserts if a transition from `currentStatus` to `nextStatus` is valid.
   * Throws an InvalidStateTransitionError if not.
   */
  public static assertCanTransition(
    currentStatus: PaymentIntentStatus,
    nextStatus: PaymentIntentStatus,
  ): void {
    if (this.TERMINAL_STATES.includes(currentStatus)) {
      throw new InvalidStateTransitionError(currentStatus, nextStatus);
    }

    const allowedNextStates = this.TRANSITIONS[currentStatus];
    if (!allowedNextStates || !allowedNextStates.includes(nextStatus)) {
      throw new InvalidStateTransitionError(currentStatus, nextStatus);
    }
  }

  /**
   * Determines if the current state actively reserves money.
   * An intent reserves money if it is CREATED, PENDING, or AUTHORIZED.
   */
  public static isActiveReservation(status: PaymentIntentStatus): boolean {
    return ['CREATED', 'PENDING', 'AUTHORIZED'].includes(status);
  }
}
