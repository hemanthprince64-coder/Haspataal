import { PaymentIntentStatus } from '@haspataal/db';
import { describe, it, expect } from 'vitest';

import {
  PaymentIntentStateMachine,
  InvalidStateTransitionError,
} from '../payments/PaymentIntentStateMachine';

describe('PaymentIntentStateMachine', () => {
  it('allows valid transitions', () => {
    expect(() => PaymentIntentStateMachine.assertCanTransition('CREATED', 'PENDING')).not.toThrow();
    expect(() =>
      PaymentIntentStateMachine.assertCanTransition('CREATED', 'CANCELLED'),
    ).not.toThrow();
    expect(() =>
      PaymentIntentStateMachine.assertCanTransition('PENDING', 'AUTHORIZED'),
    ).not.toThrow();
    expect(() =>
      PaymentIntentStateMachine.assertCanTransition('PENDING', 'CAPTURED'),
    ).not.toThrow();
    expect(() =>
      PaymentIntentStateMachine.assertCanTransition('AUTHORIZED', 'CAPTURED'),
    ).not.toThrow();
  });

  it('rejects backward transitions', () => {
    expect(() => PaymentIntentStateMachine.assertCanTransition('PENDING', 'CREATED')).toThrow(
      InvalidStateTransitionError,
    );
    expect(() => PaymentIntentStateMachine.assertCanTransition('CAPTURED', 'AUTHORIZED')).toThrow(
      InvalidStateTransitionError,
    );
    expect(() => PaymentIntentStateMachine.assertCanTransition('AUTHORIZED', 'PENDING')).toThrow(
      InvalidStateTransitionError,
    );
  });

  it('rejects transitions from terminal states', () => {
    const terminalStates: PaymentIntentStatus[] = ['CAPTURED', 'FAILED', 'CANCELLED', 'EXPIRED'];

    for (const state of terminalStates) {
      expect(() => PaymentIntentStateMachine.assertCanTransition(state, 'PENDING')).toThrow(
        InvalidStateTransitionError,
      );
      expect(() => PaymentIntentStateMachine.assertCanTransition(state, 'AUTHORIZED')).toThrow(
        InvalidStateTransitionError,
      );
    }
  });

  it('correctly identifies active reservations', () => {
    expect(PaymentIntentStateMachine.isActiveReservation('CREATED')).toBe(true);
    expect(PaymentIntentStateMachine.isActiveReservation('PENDING')).toBe(true);
    expect(PaymentIntentStateMachine.isActiveReservation('AUTHORIZED')).toBe(true);

    expect(PaymentIntentStateMachine.isActiveReservation('CAPTURED')).toBe(false);
    expect(PaymentIntentStateMachine.isActiveReservation('FAILED')).toBe(false);
    expect(PaymentIntentStateMachine.isActiveReservation('CANCELLED')).toBe(false);
    expect(PaymentIntentStateMachine.isActiveReservation('EXPIRED')).toBe(false);
  });
});
